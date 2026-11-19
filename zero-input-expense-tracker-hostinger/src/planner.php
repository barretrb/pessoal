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
