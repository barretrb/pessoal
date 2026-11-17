<?php
declare(strict_types=1);

function parse_brl_csv_amount(string $raw): ?float
{
    $clean = trim($raw, " \t\n\r\0\x0B\"'");
    if ($clean === '') {
        return null;
    }
    $clean = preg_replace('/\s+/', '', $clean) ?? $clean;
    $isNeg = str_starts_with($clean, '-');
    $clean = ltrim($clean, '+-');
    $clean = str_replace('.', '', $clean);
    $clean = str_replace(',', '.', $clean);
    if (!is_numeric($clean)) {
        return null;
    }
    $val = round((float)$clean, 2);
    return $isNeg ? -$val : $val;
}

function clean_csv_merchant(string $rawTitle): array
{
    $installments = 1;
    $title = trim($rawTitle);
    if (preg_match('/-\s*Parcela\s*\d+\s*\/\s*(\d+)/iu', $title, $m)) {
        $installments = max(1, (int)$m[1]);
    }
    $clean = preg_replace('/-\s*Parcela\s*\d+\s*\/\s*\d+/iu', '', $title) ?? $title;
    $clean = preg_replace('/^(?:Mp|Asa|Dl|Ec|Payu|Pag)\s*\*+\s*/iu', '', trim($clean)) ?? $clean;
    $clean = preg_replace('/\s*-\s*NuPay$/iu', '', trim($clean)) ?? $clean;
    $clean = trim($clean, " \t\n\r\0\x0B-\"*");
    if ($clean === '') {
        $clean = $title !== '' ? $title : 'Estabelecimento';
    }
    return [
        'merchant' => mb_substr($clean, 0, 80),
        'installments' => $installments,
    ];
}

function import_nubank_csv(
    PDO $pdo,
    array $config,
    string $csvContent,
    ?string $billingMonth = null,
    bool $autoSplitGroceries = false
): array {
    $csvContent = preg_replace('/^\xEF\xBB\xBF/', '', $csvContent) ?? $csvContent;
    $lines = preg_split('/\r\n|\r|\n/', trim($csvContent)) ?: [];
    if (count($lines) < 2) {
        return ['imported' => 0, 'skipped_duplicates' => 0, 'ignored' => 0, 'errors' => ['CSV vazio ou sem linhas.']];
    }

    $tz = new DateTimeZone($config['timezone'] ?: 'UTC');
    $utcTz = new DateTimeZone('UTC');
    $nowUtc = gmdate('Y-m-d\TH:i:s\Z');

    $useBillingMonth = ($billingMonth !== null && preg_match('/^(\d{4})-(\d{2})$/', $billingMonth, $bmMatch)) ? $bmMatch : null;

    $imported = 0;
    $skippedDup = 0;
    $ignored = 0;
    $errors = [];

    $dupStmt = $pdo->prepare(
        'SELECT id FROM transactions
         WHERE type = ? AND merchant_normalized = ?
           AND ABS(COALESCE(full_amount, amount) - ?) < 0.01
           AND occurred_at >= ? AND occurred_at <= ?
         LIMIT 1'
    );

    $insStmt = $pdo->prepare(
        'INSERT INTO transactions (source, app_name, raw_title, raw_text, type, amount, merchant, merchant_normalized, installments, category, confidence, status, occurred_at, is_shared, split_ratio, full_amount, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    foreach ($lines as $idx => $line) {
        $line = trim($line);
        if ($line === '') {
            continue;
        }
        $cols = str_getcsv($line);
        if (count($cols) < 3) {
            continue;
        }
        $dateRaw = trim((string)$cols[0]);
        $titleRaw = trim((string)$cols[1]);
        $amountRaw = trim((string)$cols[2]);

        // Skip header
        if ($idx === 0 && strtolower($dateRaw) === 'date') {
            continue;
        }

        if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $dateRaw, $dm)) {
            $errors[] = "Linha " . ($idx + 1) . ": data inválida ({$dateRaw})";
            continue;
        }

        $parsedAmt = parse_brl_csv_amount($amountRaw);
        if ($parsedAmt === null || abs($parsedAmt) < 0.01) {
            $ignored++;
            continue;
        }

        $titleNorm = normalize_text($titleRaw);
        if (str_contains($titleNorm, 'pagamento recebido')) {
            $ignored++;
            continue;
        }

        $txType = $parsedAmt < 0 ? 'INCOME' : 'EXPENSE';
        $fullAmount = round(abs($parsedAmt), 2);
        $cleaned = clean_csv_merchant($titleRaw);
        $merchantDisplay = $cleaned['merchant'];
        $merchantNorm = normalize_text($merchantDisplay) ?: 'estabelecimento';

        // Categorize & check merchant_memory split preference
        $splitRatio = 1.0;
        $mem = find_merchant_memory($pdo, $merchantDisplay);
        if ($mem !== null) {
            $category = $mem['category'];
            $confidence = 0.96;
            $memSplit = (float)($mem['default_split_ratio'] ?? 1.0);
            if ($memSplit > 0.0 && $memSplit < 0.99) {
                $splitRatio = $memSplit;
            }
        } else {
            $kw = categorize_by_keywords($titleRaw . ' ' . $merchantDisplay);
            $category = $kw['category'];
            $confidence = $kw['confidence'];
        }

        if ($txType === 'EXPENSE' && $autoSplitGroceries && $category === 'Mercado/Casa') {
            $splitRatio = 0.5;
        }

        $effAmount = round($fullAmount * $splitRatio, 2);
        $isShared = $splitRatio < 0.99 ? 1 : 0;

        // Compute occurred_at
        if ($useBillingMonth !== null) {
            $targetY = (int)$useBillingMonth[1];
            $targetM = (int)$useBillingMonth[2];
            $day = min(max((int)$dm[3], 1), 28);
            $occLocal = new DateTimeImmutable(sprintf('%04d-%02d-%02d 12:00:00', $targetY, $targetM, $day), $tz);
        } else {
            $occLocal = new DateTimeImmutable("{$dateRaw} 12:00:00", $tz);
        }
        $occIso = $occLocal->setTimezone($utcTz)->format('Y-m-d\TH:i:s\Z');
        $winStart = $occLocal->modify('-1 day')->setTimezone($utcTz)->format('Y-m-d\TH:i:s\Z');
        $winEnd = $occLocal->modify('+1 day')->setTimezone($utcTz)->format('Y-m-d\TH:i:s\Z');

        // Deduplicate
        $dupStmt->execute([$txType, $merchantNorm, $fullAmount, $winStart, $winEnd]);
        if ($dupStmt->fetch()) {
            $skippedDup++;
            continue;
        }

        $insStmt->execute([
            'CSV_FATURA',
            'Nubank CSV',
            $titleRaw,
            "Fatura CSV ({$dateRaw}): {$titleRaw}",
            $txType,
            $effAmount,
            $merchantDisplay,
            $merchantNorm,
            $cleaned['installments'],
            $category,
            $confidence,
            'CONFIRMED',
            $occIso,
            $isShared,
            $splitRatio,
            $fullAmount,
            $nowUtc,
        ]);
        $imported++;
    }

    return [
        'imported' => $imported,
        'skipped_duplicates' => $skippedDup,
        'ignored' => $ignored,
        'errors' => $errors,
    ];
}
