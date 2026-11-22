<?php
declare(strict_types=1);

function ensure_month_provision(PDO $pdo, array $config, ?string $targetDateStr = null): array
{
    $tz = new DateTimeZone($config['timezone'] ?: 'UTC');
    $targetDate = $targetDateStr
        ? new DateTimeImmutable($targetDateStr, $tz)
        : new DateTimeImmutable('now', $tz);

    $year = (int)$targetDate->format('Y');
    $month = (int)$targetDate->format('n');
    $daysInMonth = (int)$targetDate->format('t');
    $period = sprintf('%04d-%02d', $year, $month);
    $nowUtc = gmdate('Y-m-d\TH:i:s\Z');

    $plans = $pdo->query('SELECT * FROM annual_plan WHERE active = 1')->fetchAll();
    $createdIds = [];
    $skippedCount = 0;

    $chk = $pdo->prepare('SELECT id FROM transactions WHERE annual_plan_id = ? AND plan_period = ? LIMIT 1');
    $ins = $pdo->prepare(
        'INSERT INTO transactions (source, app_name, raw_title, raw_text, type, amount, merchant, merchant_normalized, installments, category, confidence, status, occurred_at, annual_plan_id, plan_period, is_shared, split_ratio, full_amount, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1.0, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    foreach ($plans as $plan) {
        $startM = (int)$plan['start_month'];
        $endM = (int)$plan['end_month'];
        $inRange = ($startM <= $endM)
            ? ($month >= $startM && $month <= $endM)
            : ($month >= $startM || $month <= $endM);

        if (!$inRange) {
            continue;
        }

        $chk->execute([$plan['id'], $period]);
        if ($chk->fetch()) {
            $skippedCount++;
            continue;
        }

        $dueDay = min((int)$plan['day_of_month'], $daysInMonth);
        $occLocal = new DateTimeImmutable(sprintf('%04d-%02d-%02d 08:00:00', $year, $month, $dueDay), $tz);
        $occUtc = $occLocal->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
        $txStatus = ($plan['type'] === 'INCOME') ? 'CONFIRMED' : 'ESTIMATED';
        $splitRatio = (float)($plan['split_ratio'] ?? 1.0);
        if ($splitRatio <= 0.0 || $splitRatio > 1.0) {
            $splitRatio = 1.0;
        }
        $fullAmount = round((float)$plan['amount'], 2);
        $effAmount = round($fullAmount * $splitRatio, 2);
        $isShared = $splitRatio < 0.99 ? 1 : 0;

        $ins->execute([
            'FIXED_PLAN',
            'annual_plan',
            $plan['title'],
            "Provisão mensal ({$period})",
            $plan['type'],
            $effAmount,
            $plan['title'],
            normalize_text($plan['title']) ?: 'plano_anual',
            $plan['category'],
            $txStatus,
            $occUtc,
            $plan['id'],
            $period,
            $isShared,
            $splitRatio,
            $fullAmount,
            $nowUtc,
        ]);
        $createdIds[] = (int)$pdo->lastInsertId();
    }

    return [
        'target_date' => $targetDate->format('Y-m-d'),
        'period' => $period,
        'created_count' => count($createdIds),
        'skipped_count' => $skippedCount,
        'created_ids' => $createdIds,
    ];
}

function run_daily_plan_cron(PDO $pdo, array $config, ?string $targetDateStr = null): array
{
    return ensure_month_provision($pdo, $config, $targetDateStr);
}

function recalculate_rolling_average(PDO $pdo, int $planId): ?float
{
    $planStmt = $pdo->prepare('SELECT * FROM annual_plan WHERE id = ? LIMIT 1');
    $planStmt->execute([$planId]);
    $plan = $planStmt->fetch();
    if (!$plan || ($plan['plan_type'] ?? 'FIXED') !== 'ROLLING_AVERAGE') {
        return null;
    }

    $histStmt = $pdo->prepare(
        "SELECT COALESCE(full_amount, amount) AS eff_amount FROM transactions WHERE annual_plan_id = ? AND status = 'CONFIRMED' AND type = 'EXPENSE' ORDER BY occurred_at DESC, id DESC LIMIT 3"
    );
    $histStmt->execute([$planId]);
    $rows = $histStmt->fetchAll();
    if (!$rows) {
        return null;
    }

    $sum = 0.0;
    foreach ($rows as $r) {
        $sum += (float)$r['eff_amount'];
    }
    $avg = round($sum / count($rows), 2);
    $pdo->prepare('UPDATE annual_plan SET amount = ?, updated_at = ? WHERE id = ?')
        ->execute([$avg, gmdate('Y-m-d\TH:i:s\Z'), $planId]);
    $estRows = $pdo->prepare("SELECT id, split_ratio FROM transactions WHERE annual_plan_id = ? AND status = 'ESTIMATED'");
    $estRows->execute([$planId]);
    foreach ($estRows->fetchAll() as $er) {
        $sr = (float)($er['split_ratio'] ?? 1.0);
        if ($sr <= 0.0 || $sr > 1.0) {
            $sr = 1.0;
        }
        $eff = round($avg * $sr, 2);
        $pdo->prepare('UPDATE transactions SET amount = ?, full_amount = ? WHERE id = ?')
            ->execute([$eff, $avg, (int)$er['id']]);
    }
    return $avg;
}

function reconcile_transaction_amount(PDO $pdo, int $txId, float $realAmount): array
{
    $stmt = $pdo->prepare('SELECT * FROM transactions WHERE id = ? LIMIT 1');
    $stmt->execute([$txId]);
    $tx = $stmt->fetch();
    if (!$tx) {
        throw new RuntimeException('Transaction not found');
    }

    $fullRounded = round($realAmount, 2);
    $splitRatio = (float)($tx['split_ratio'] ?? 1.0);
    if ($splitRatio <= 0.0 || $splitRatio > 1.0) {
        $splitRatio = 1.0;
    }
    $effAmount = round($fullRounded * $splitRatio, 2);
    $isShared = $splitRatio < 0.99 ? 1 : 0;

    $pdo->prepare("UPDATE transactions SET amount = ?, full_amount = ?, is_shared = ?, split_ratio = ?, status = 'CONFIRMED' WHERE id = ?")
        ->execute([$effAmount, $fullRounded, $isShared, $splitRatio, $txId]);

    $newAvg = null;
    $planId = $tx['annual_plan_id'] ? (int)$tx['annual_plan_id'] : null;
    if ($planId !== null) {
        $newAvg = recalculate_rolling_average($pdo, $planId);
    }

    return [
        'transaction_id' => $txId,
        'annual_plan_id' => $planId,
        'amount' => $effAmount,
        'full_amount' => $fullRounded,
        'split_ratio' => $splitRatio,
        'status' => 'CONFIRMED',
        'new_rolling_average' => $newAvg,
    ];
}

function set_transaction_split(PDO $pdo, int $txId, float $targetRatio): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM transactions WHERE id = ? LIMIT 1');
    $stmt->execute([$txId]);
    $tx = $stmt->fetch();
    if (!$tx || $tx['type'] !== 'EXPENSE') {
        return null;
    }

    $currentlyShared = ((int)($tx['is_shared'] ?? 0) === 1) || ((float)($tx['split_ratio'] ?? 1.0) < 0.99);
    $currentAmt = (float)$tx['amount'];
    $storedFull = isset($tx['full_amount']) && $tx['full_amount'] !== null ? (float)$tx['full_amount'] : null;
    $newFull = $storedFull ?? ($currentlyShared ? round($currentAmt * 2.0, 2) : $currentAmt);

    $newRatio = ($targetRatio < 0.99) ? 0.5 : 1.0;
    $newShared = ($newRatio < 0.99) ? 1 : 0;
    $newAmt = round($newFull * $newRatio, 2);

    $pdo->prepare('UPDATE transactions SET amount = ?, full_amount = ?, is_shared = ?, split_ratio = ? WHERE id = ?')
        ->execute([$newAmt, $newFull, $newShared, $newRatio, $txId]);

    $stmt->execute([$txId]);
    return $stmt->fetch() ?: null;
}

function toggle_transaction_split(PDO $pdo, int $txId): ?array
{
    $stmt = $pdo->prepare('SELECT is_shared, split_ratio FROM transactions WHERE id = ? LIMIT 1');
    $stmt->execute([$txId]);
    $tx = $stmt->fetch();
    if (!$tx) {
        return null;
    }

    $currentlyShared = ((int)($tx['is_shared'] ?? 0) === 1) || ((float)($tx['split_ratio'] ?? 1.0) < 0.99);
    return set_transaction_split($pdo, $txId, $currentlyShared ? 1.0 : 0.5);
}

function toggle_plan_split(PDO $pdo, int $planId, string $period): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM annual_plan WHERE id = ? LIMIT 1');
    $stmt->execute([$planId]);
    $plan = $stmt->fetch();
    if (!$plan) {
        return null;
    }

    $curRatio = (float)($plan['split_ratio'] ?? 1.0);
    $newRatio = ($curRatio < 0.99) ? 1.0 : 0.5;
    $isShared = $newRatio < 0.99 ? 1 : 0;

    $pdo->prepare('UPDATE annual_plan SET split_ratio = ?, updated_at = ? WHERE id = ?')
        ->execute([$newRatio, gmdate('Y-m-d\TH:i:s\Z'), $planId]);

    // Also update current period's provisioned transaction if present
    $txStmt = $pdo->prepare('SELECT * FROM transactions WHERE annual_plan_id = ? AND plan_period = ? LIMIT 1');
    $txStmt->execute([$planId, $period]);
    $tx = $txStmt->fetch();
    if ($tx) {
        $fullAmt = isset($tx['full_amount']) && $tx['full_amount'] !== null
            ? (float)$tx['full_amount']
            : (float)$plan['amount'];
        $effAmt = round($fullAmt * $newRatio, 2);
        $pdo->prepare('UPDATE transactions SET amount = ?, full_amount = ?, is_shared = ?, split_ratio = ? WHERE id = ?')
            ->execute([$effAmt, $fullAmt, $isShared, $newRatio, (int)$tx['id']]);
    }

    $stmt->execute([$planId]);
    return $stmt->fetch() ?: null;
}

function find_matching_rolling_tx(PDO $pdo, string $merchantText, string $period): ?array
{
    $norm = normalize_text($merchantText);
    if ($norm === '') {
        return null;
    }
    $plans = $pdo->query("SELECT * FROM annual_plan WHERE plan_type = 'ROLLING_AVERAGE' AND active = 1")->fetchAll();
    foreach ($plans as $plan) {
        $titleNorm = normalize_text($plan['title']);
        $tokens = array_filter(explode(' ', $titleNorm), fn($t) => strlen($t) >= 4);
        $matched = false;
        foreach ($tokens as $tok) {
            if (str_contains($norm, $tok)) {
                $matched = true;
                break;
            }
        }
        if ($matched) {
            $txStmt = $pdo->prepare('SELECT * FROM transactions WHERE annual_plan_id = ? AND plan_period = ? LIMIT 1');
            $txStmt->execute([$plan['id'], $period]);
            $tx = $txStmt->fetch();
            if ($tx) {
                return $tx;
            }
        }
    }
    return null;
}

function find_matching_fixed_card_tx(PDO $pdo, float $amount, string $merchantText, string $period): ?array
{
    $norm = normalize_text($merchantText);
    $plans = $pdo->query("SELECT * FROM annual_plan WHERE plan_type = 'FIXED' AND payment_method = 'Cartão' AND active = 1")->fetchAll();
    foreach ($plans as $plan) {
        if (abs((float)$plan['amount'] - $amount) > 1.00) {
            continue;
        }
        $titleNorm = normalize_text($plan['title']);
        $tokens = array_filter(explode(' ', $titleNorm), fn($t) => strlen($t) >= 4);
        $matched = ($norm === '') ? true : false;
        foreach ($tokens as $tok) {
            if (str_contains($norm, $tok)) {
                $matched = true;
                break;
            }
        }
        if ($matched) {
            $txStmt = $pdo->prepare('SELECT * FROM transactions WHERE annual_plan_id = ? AND plan_period = ? LIMIT 1');
            $txStmt->execute([$plan['id'], $period]);
            $tx = $txStmt->fetch();
            if ($tx) {
                return $tx;
            }
        }
    }
    return null;
}


function apply_transaction_installments(
    PDO $pdo,
    int $txId,
    int $installments,
    bool $divideAndProject = true
): array {
    $stmt = $pdo->prepare('SELECT * FROM transactions WHERE id = ? LIMIT 1');
    $stmt->execute([$txId]);
    $tx = $stmt->fetch();
    if (!$tx) {
        throw new RuntimeException('Transaction not found');
    }

    $qty = max(1, min(48, $installments));
    $splitRatio = (float)($tx['split_ratio'] ?? 1.0);
    if ($splitRatio <= 0.0 || $splitRatio > 1.0) {
        $splitRatio = 1.0;
    }
    $isShared = $splitRatio < 0.99 ? 1 : 0;

    // Check if there are previously projected child installments for this txId
    $refTag = "ref_tx:{$txId}";
    $childStmt = $pdo->prepare('SELECT id, COALESCE(full_amount, amount) AS fa FROM transactions WHERE raw_text LIKE ?');
    $childStmt->execute(['%' . $refTag]);
    $children = $childStmt->fetchAll();

    $parentFull = (float)($tx['full_amount'] ?? $tx['amount']);
    $recoveredTotalFull = $parentFull;
    foreach ($children as $ch) {
        $recoveredTotalFull += (float)$ch['fa'];
    }
    $recoveredTotalFull = round($recoveredTotalFull, 2);

    $baseMerchant = trim((string)preg_replace('/\s*(?:\(\d+\s*\/\s*\d+\)|-\s*Parcela\s*\d+\s*\/\s*\d+)\s*$/iu', '', (string)$tx['merchant']));
    if ($baseMerchant === '') {
        $baseMerchant = (string)$tx['merchant'];
    }

    if (!$divideAndProject) {
        $newMerch = $qty > 1 ? "{$baseMerchant} (1/{$qty})" : $baseMerchant;
        $pdo->prepare('UPDATE transactions SET merchant = ?, merchant_normalized = ?, installments = ? WHERE id = ?')
            ->execute([$newMerch, normalize_text($newMerch) ?: 'estabelecimento', $qty, $txId]);
        return [
            'transaction_id' => $txId,
            'merchant' => $newMerch,
            'installments' => $qty,
            'per_installment_full' => $parentFull,
            'per_installment_effective' => (float)$tx['amount'],
            'projected_created' => 0,
        ];
    }

    // Remove previous projected child installments if re-splitting
    if (!empty($children)) {
        $pdo->prepare('DELETE FROM transactions WHERE raw_text LIKE ?')->execute(['%' . $refTag]);
    }

    if ($qty === 1) {
        $effAmt = round($recoveredTotalFull * $splitRatio, 2);
        $pdo->prepare('UPDATE transactions SET merchant = ?, merchant_normalized = ?, installments = 1, full_amount = ?, amount = ? WHERE id = ?')
            ->execute([$baseMerchant, normalize_text($baseMerchant) ?: 'estabelecimento', $recoveredTotalFull, $effAmt, $txId]);
        return [
            'transaction_id' => $txId,
            'merchant' => $baseMerchant,
            'installments' => 1,
            'per_installment_full' => $recoveredTotalFull,
            'per_installment_effective' => $effAmt,
            'projected_created' => 0,
        ];
    }

    $basePartFull = floor(($recoveredTotalFull / $qty) * 100) / 100;
    $firstPartFull = round($recoveredTotalFull - ($basePartFull * ($qty - 1)), 2);
    $firstEff = round($firstPartFull * $splitRatio, 2);
    $merch1 = "{$baseMerchant} (1/{$qty})";

    $pdo->prepare('UPDATE transactions SET merchant = ?, merchant_normalized = ?, installments = ?, full_amount = ?, amount = ? WHERE id = ?')
        ->execute([$merch1, normalize_text($merch1) ?: 'estabelecimento', $qty, $firstPartFull, $firstEff, $txId]);

    $occDt = new DateTimeImmutable((string)$tx['occurred_at'], new DateTimeZone('UTC'));
    $baseYear = (int)$occDt->format('Y');
    $baseMonth = (int)$occDt->format('n');
    $baseDay = min((int)$occDt->format('j'), 28);
    $nowUtc = gmdate('Y-m-d\TH:i:s\Z');

    $ins = $pdo->prepare(
        'INSERT INTO transactions (source, app_name, raw_title, raw_text, type, amount, full_amount, is_shared, split_ratio, merchant, merchant_normalized, installments, category, confidence, status, occurred_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1.0, ?, ?, ?)'
    );

    $partEff = round($basePartFull * $splitRatio, 2);
    for ($i = 2; $i <= $qty; $i++) {
        $totalMonths = ($baseYear * 12 + ($baseMonth - 1)) + ($i - 1);
        $targetY = intdiv($totalMonths, 12);
        $targetM = ($totalMonths % 12) + 1;
        $nextOcc = sprintf('%04d-%02d-%02dT15:00:00Z', $targetY, $targetM, $baseDay);
        $merchI = "{$baseMerchant} ({$i}/{$qty})";
        $ins->execute([
            (string)$tx['source'],
            (string)($tx['app_name'] ?? 'Parcelamento'),
            $merchI,
            "Parcela {$i}/{$qty} {$refTag}",
            (string)$tx['type'],
            $partEff,
            $basePartFull,
            $isShared,
            $splitRatio,
            $merchI,
            normalize_text($merchI) ?: 'estabelecimento',
            $qty,
            (string)$tx['category'],
            'CONFIRMED',
            $nextOcc,
            $nowUtc,
        ]);
    }

    return [
        'transaction_id' => $txId,
        'merchant' => $merch1,
        'installments' => $qty,
        'per_installment_full' => $basePartFull,
        'per_installment_effective' => $partEff,
        'projected_created' => $qty - 1,
    ];
}
