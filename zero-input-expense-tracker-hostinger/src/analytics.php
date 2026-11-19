<?php
declare(strict_types=1);

const MONTH_NAMES_PT = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

function format_brl(float $value): string
{
    return number_format($value, 2, ',', '.');
}

function get_available_periods(PDO $pdo, array $config, ?string $includePeriod = null): array
{
    $tz = new DateTimeZone($config['timezone'] ?: 'UTC');
    $periods = [];
    $rows = $pdo->query('SELECT occurred_at, plan_period FROM transactions')->fetchAll();
    foreach ($rows as $r) {
        $pp = trim((string)($r['plan_period'] ?? ''));
        if (preg_match('/^\d{4}-\d{2}$/', $pp)) {
            $periods[$pp] = true;
            continue;
        }
        $occ = (string)($r['occurred_at'] ?? '');
        if ($occ !== '') {
            try {
                $dt = new DateTimeImmutable($occ, new DateTimeZone('UTC'));
                $ym = $dt->setTimezone($tz)->format('Y-m');
                $periods[$ym] = true;
            } catch (Throwable $e) {
            }
        }
    }
    if ($includePeriod !== null && preg_match('/^\d{4}-\d{2}$/', $includePeriod)) {
        $periods[$includePeriod] = true;
    }
    if (empty($periods)) {
        $periods[(new DateTimeImmutable('now', $tz))->format('Y-m')] = true;
    }
    $list = array_keys($periods);
    rsort($list);
    return $list;
}

function get_all_categories(PDO $pdo, array $config): array
{
    $count = (int)$pdo->query('SELECT COUNT(*) FROM categories')->fetchColumn();
    $now = gmdate('Y-m-d\TH:i:s\Z');
    $ins = $pdo->prepare('INSERT OR IGNORE INTO categories (name, created_at) VALUES (?, ?)');
    if ($count === 0) {
        foreach ($config['categories'] ?? [] as $defCat) {
            $defCat = trim((string)$defCat);
            if ($defCat !== '') {
                $ins->execute([$defCat, $now]);
            }
        }
    }
    foreach ($pdo->query('SELECT DISTINCT category FROM annual_plan')->fetchAll() as $r) {
        $n = trim((string)$r['category']);
        if ($n !== '') {
            $ins->execute([$n, $now]);
        }
    }
    foreach ($pdo->query('SELECT DISTINCT category FROM transactions')->fetchAll() as $r) {
        $n = trim((string)$r['category']);
        if ($n !== '') {
            $ins->execute([$n, $now]);
        }
    }
    $result = [];
    foreach ($pdo->query('SELECT name FROM categories ORDER BY id ASC')->fetchAll() as $r) {
        $n = trim((string)$r['name']);
        if ($n !== '' && !in_array($n, $result, true)) {
            $result[] = $n;
        }
    }
    if (!in_array('Outros', $result, true)) {
        $ins->execute(['Outros', $now]);
        $result[] = 'Outros';
    }
    return $result;
}

function ensure_category_exists(PDO $pdo, array $config, string $name): string
{
    get_all_categories($pdo, $config);
    $clean = mb_substr(trim($name), 0, 64);
    if ($clean === '') {
        return 'Outros';
    }
    $pdo->prepare('INSERT OR IGNORE INTO categories (name, created_at) VALUES (?, ?)')
        ->execute([$clean, gmdate('Y-m-d\TH:i:s\Z')]);
    return $clean;
}

function compute_monthly_summary(PDO $pdo, array $config, ?int $year = null, ?int $month = null): array
{
    $tz = new DateTimeZone($config['timezone'] ?: 'UTC');
    $now = new DateTimeImmutable('now', $tz);
    $targetYear = $year ?? (int)$now->format('Y');
    $targetMonth = $month ?? (int)$now->format('n');

    $daysInMonth = (int)(new DateTimeImmutable(sprintf('%04d-%02d-01', $targetYear, $targetMonth), $tz))->format('t');
    $startUtc = (new DateTimeImmutable(sprintf('%04d-%02d-01 00:00:00', $targetYear, $targetMonth), $tz))
        ->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
    $endUtc = (new DateTimeImmutable(sprintf('%04d-%02d-%02d 23:59:59', $targetYear, $targetMonth, $daysInMonth), $tz))
        ->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');

    $stmt = $pdo->prepare(
        'SELECT * FROM transactions WHERE occurred_at >= ? AND occurred_at <= ? ORDER BY occurred_at DESC, id DESC'
    );
    $stmt->execute([$startUtc, $endUtc]);
    $txs = $stmt->fetchAll();

    $totalIncome = 0.0;
    $fixedExpenses = 0.0;
    $variableExpenses = 0.0;
    $pendingCount = 0;
    $categoryTotals = [];
    $dailyExpenses = [];

    foreach ($txs as $tx) {
        if ($tx['status'] === 'PENDING') {
            $pendingCount++;
            continue;
        }
        if (!in_array($tx['status'], ['CONFIRMED', 'ESTIMATED'], true)) {
            continue;
        }
        $amount = (float)$tx['amount'];
        if ($tx['type'] === 'INCOME') {
            $totalIncome += $amount;
        } elseif ($tx['type'] === 'EXPENSE') {
            if ($tx['source'] === 'FIXED_PLAN') {
                $fixedExpenses += $amount;
            } else {
                $variableExpenses += $amount;
            }
            $cat = $tx['category'];
            $categoryTotals[$cat] = ($categoryTotals[$cat] ?? 0.0) + $amount;

            $occ = new DateTimeImmutable($tx['occurred_at'], new DateTimeZone('UTC'));
            $day = (int)$occ->setTimezone($tz)->format('j');
            $dailyExpenses[$day] = ($dailyExpenses[$day] ?? 0.0) + $amount;
        }
    }

    $totalExpenses = $fixedExpenses + $variableExpenses;
    $saldoLivre = $totalIncome - $totalExpenses;
    $budgetLimit = ((float)$config['monthly_budget_limit'] > 0) ? (float)$config['monthly_budget_limit'] : $totalIncome;

    $labels = [];
    $actualCum = [];
    $plannedCum = [];
    $running = 0.0;

    for ($d = 1; $d <= $daysInMonth; $d++) {
        $labels[] = sprintf('%02d', $d);
        $running += $dailyExpenses[$d] ?? 0.0;
        $actualCum[] = round($running, 2);
        $plannedCum[] = round($budgetLimit * ($d / $daysInMonth), 2);
    }

    arsort($categoryTotals);
    $breakdown = [];
    foreach ($categoryTotals as $cat => $val) {
        $pct = $totalExpenses > 0 ? round(($val / $totalExpenses) * 100, 1) : 0.0;
        $breakdown[] = [
            'category' => $cat,
            'total' => round($val, 2),
            'total_brl' => format_brl($val),
            'percentage' => $pct,
        ];
    }

    $periodStr = sprintf('%04d-%02d', $targetYear, $targetMonth);
    $rollingPlans = $pdo->query("SELECT * FROM annual_plan WHERE plan_type = 'ROLLING_AVERAGE' AND active = 1 ORDER BY id ASC")->fetchAll();
    $consumptionBills = [];
    $histStmt = $pdo->prepare(
        "SELECT amount FROM transactions WHERE type = 'EXPENSE' AND status = 'CONFIRMED' AND annual_plan_id = ? ORDER BY occurred_at DESC, id DESC LIMIT 3"
    );

    foreach ($rollingPlans as $plan) {
        $currentTx = null;
        foreach ($txs as $t) {
            if ((int)($t['annual_plan_id'] ?? 0) === (int)$plan['id'] && ($t['plan_period'] ?? '') === $periodStr) {
                $currentTx = $t;
                break;
            }
        }
        $histStmt->execute([$plan['id']]);
        $histRows = $histStmt->fetchAll();
        if ($histRows) {
            $sumHist = 0.0;
            foreach ($histRows as $hr) {
                $sumHist += (float)$hr['amount'];
            }
            $avgVal = round($sumHist / count($histRows), 2);
        } else {
            $avgVal = (float)$plan['amount'];
        }
        $curAmt = $currentTx ? (float)$currentTx['amount'] : (float)$plan['amount'];
        $consumptionBills[] = [
            'plan_id' => (int)$plan['id'],
            'title' => $plan['title'],
            'due_day' => (int)$plan['day_of_month'],
            'payment_method' => $plan['payment_method'] ?? 'PIX',
            'transaction_id' => $currentTx ? (int)$currentTx['id'] : null,
            'status' => $currentTx ? $currentTx['status'] : 'NOT_PROVISIONED',
            'current_amount' => $curAmt,
            'current_amount_brl' => format_brl($curAmt),
            'provisioned_amount' => (float)$plan['amount'],
            'provisioned_amount_brl' => format_brl((float)$plan['amount']),
            'rolling_avg_3m' => $avgVal,
            'rolling_avg_3m_brl' => format_brl($avgVal),
            'confirmed_months' => count($histRows),
        ];
    }

    return [
        'year' => $targetYear,
        'month' => $targetMonth,
        'period' => $periodStr,
        'total_income' => $totalIncome,
        'total_income_brl' => format_brl($totalIncome),
        'fixed_expenses' => $fixedExpenses,
        'fixed_expenses_brl' => format_brl($fixedExpenses),
        'variable_expenses' => $variableExpenses,
        'variable_expenses_brl' => format_brl($variableExpenses),
        'total_expenses' => $totalExpenses,
        'total_expenses_brl' => format_brl($totalExpenses),
        'saldo_livre' => $saldoLivre,
        'saldo_livre_brl' => format_brl($saldoLivre),
        'budget_limit' => $budgetLimit,
        'budget_limit_brl' => format_brl($budgetLimit),
        'pending_count' => $pendingCount,
        'burn_rate' => [
            'labels' => $labels,
            'actual' => $actualCum,
            'planned' => $plannedCum,
        ],
        'category_breakdown' => $breakdown,
        'consumption_bills' => $consumptionBills,
        'available_periods' => get_available_periods($pdo, $config, $periodStr),
        'transactions' => array_slice($txs, 0, 50),
    ];
}

function compute_yearly_summary(PDO $pdo, array $config, ?int $year = null): array
{
    $tz = new DateTimeZone($config['timezone'] ?: 'UTC');
    $now = new DateTimeImmutable('now', $tz);
    $targetYear = $year ?? (int)$now->format('Y');

    $startUtc = (new DateTimeImmutable(sprintf('%04d-01-01 00:00:00', $targetYear), $tz))
        ->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
    $endUtc = (new DateTimeImmutable(sprintf('%04d-12-31 23:59:59', $targetYear), $tz))
        ->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');

    $stmt = $pdo->prepare(
        "SELECT * FROM transactions WHERE occurred_at >= ? AND occurred_at <= ? AND status IN ('CONFIRMED', 'ESTIMATED')"
    );
    $stmt->execute([$startUtc, $endUtc]);
    $txs = $stmt->fetchAll();

    $monthly = [];
    for ($m = 1; $m <= 12; $m++) {
        $monthly[$m] = ['income' => 0.0, 'fixed' => 0.0, 'variable' => 0.0, 'tx_count' => 0];
    }

    foreach ($txs as $tx) {
        $occ = new DateTimeImmutable($tx['occurred_at'], new DateTimeZone('UTC'));
        $m = (int)$occ->setTimezone($tz)->format('n');
        $amt = (float)$tx['amount'];
        $monthly[$m]['tx_count']++;
        if ($tx['type'] === 'INCOME') {
            $monthly[$m]['income'] += $amt;
        } elseif ($tx['type'] === 'EXPENSE') {
            if ($tx['source'] === 'FIXED_PLAN') {
                $monthly[$m]['fixed'] += $amt;
            } else {
                $monthly[$m]['variable'] += $amt;
            }
        }
    }

    $monthsOut = [];
    $totInc = 0.0;
    $totFix = 0.0;
    $totVar = 0.0;

    for ($m = 1; $m <= 12; $m++) {
        $inc = $monthly[$m]['income'];
        $fix = $monthly[$m]['fixed'];
        $var = $monthly[$m]['variable'];
        $exp = $fix + $var;
        $saldo = $inc - $exp;
        $totInc += $inc;
        $totFix += $fix;
        $totVar += $var;
        $monthsOut[] = [
            'month' => $m,
            'label' => MONTH_NAMES_PT[$m - 1],
            'income' => $inc,
            'income_brl' => format_brl($inc),
            'fixed_expenses' => $fix,
            'fixed_expenses_brl' => format_brl($fix),
            'variable_expenses' => $var,
            'variable_expenses_brl' => format_brl($var),
            'total_expenses' => $exp,
            'total_expenses_brl' => format_brl($exp),
            'saldo_livre' => $saldo,
            'saldo_livre_brl' => format_brl($saldo),
            'tx_count' => $monthly[$m]['tx_count'],
        ];
    }

    $totExp = $totFix + $totVar;
    $totSaldo = $totInc - $totExp;
    return [
        'year' => $targetYear,
        'months' => $monthsOut,
        'totals' => [
            'income' => $totInc,
            'income_brl' => format_brl($totInc),
            'fixed_expenses' => $totFix,
            'fixed_expenses_brl' => format_brl($totFix),
            'variable_expenses' => $totVar,
            'variable_expenses_brl' => format_brl($totVar),
            'total_expenses' => $totExp,
            'total_expenses_brl' => format_brl($totExp),
            'saldo_livre' => $totSaldo,
            'saldo_livre_brl' => format_brl($totSaldo),
        ],
    ];
}

function query_detailed_transactions(PDO $pdo, array $config, array $filters): array
{
    $tz = new DateTimeZone($config['timezone'] ?: 'UTC');
    $now = new DateTimeImmutable('now', $tz);
    $targetYear = !empty($filters['year']) ? (int)$filters['year'] : (int)$now->format('Y');
    $month = isset($filters['month']) ? (int)$filters['month'] : (int)$now->format('n');

    if ($month >= 1 && $month <= 12) {
        $daysInMonth = (int)(new DateTimeImmutable(sprintf('%04d-%02d-01', $targetYear, $month), $tz))->format('t');
        $startUtc = (new DateTimeImmutable(sprintf('%04d-%02d-01 00:00:00', $targetYear, $month), $tz))
            ->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
        $endUtc = (new DateTimeImmutable(sprintf('%04d-%02d-%02d 23:59:59', $targetYear, $month, $daysInMonth), $tz))
            ->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
    } else {
        $startUtc = (new DateTimeImmutable(sprintf('%04d-01-01 00:00:00', $targetYear), $tz))
            ->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
        $endUtc = (new DateTimeImmutable(sprintf('%04d-12-31 23:59:59', $targetYear), $tz))
            ->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
    }

    $where = ['occurred_at >= ?', 'occurred_at <= ?'];
    $params = [$startUtc, $endUtc];

    if (!empty($filters['category'])) {
        $where[] = 'category = ?';
        $params[] = $filters['category'];
    }
    if (!empty($filters['tx_type'])) {
        $where[] = 'type = ?';
        $params[] = $filters['tx_type'];
    }
    if (!empty($filters['source'])) {
        $where[] = 'source = ?';
        $params[] = $filters['source'];
    }
    if (!empty($filters['status'])) {
        $where[] = 'status = ?';
        $params[] = $filters['status'];
    }
    if ($filters['min_amount'] !== null && $filters['min_amount'] !== '') {
        $minVal = (float)str_replace(',', '.', (string)$filters['min_amount']);
        $where[] = 'amount >= ?';
        $params[] = $minVal;
    }
    if ($filters['max_amount'] !== null && $filters['max_amount'] !== '') {
        $maxVal = (float)str_replace(',', '.', (string)$filters['max_amount']);
        $where[] = 'amount <= ?';
        $params[] = $maxVal;
    }

    $sql = 'SELECT * FROM transactions WHERE ' . implode(' AND ', $where) . ' ORDER BY occurred_at DESC, id DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $search = trim((string)($filters['q'] ?? ''));
    if ($search !== '') {
        $qLow = mb_strtolower($search);
        $rows = array_values(array_filter($rows, function ($t) use ($qLow) {
            return str_contains(mb_strtolower((string)($t['merchant'] ?? '')), $qLow)
                || str_contains(mb_strtolower((string)($t['category'] ?? '')), $qLow)
                || str_contains(mb_strtolower((string)($t['raw_title'] ?? '')), $qLow)
                || str_contains(mb_strtolower((string)($t['raw_text'] ?? '')), $qLow);
        }));
    }

    $totInc = 0.0;
    $totExp = 0.0;
    foreach ($rows as $t) {
        if (!in_array($t['status'], ['CONFIRMED', 'ESTIMATED'], true)) {
            continue;
        }
        if ($t['type'] === 'INCOME') {
            $totInc += (float)$t['amount'];
        } elseif ($t['type'] === 'EXPENSE') {
            $totExp += (float)$t['amount'];
        }
    }
    $net = $totInc - $totExp;

    return [
        'year' => $targetYear,
        'month' => $month,
        'transactions' => $rows,
        'total_count' => count($rows),
        'total_income' => $totInc,
        'total_income_brl' => format_brl($totInc),
        'total_expense' => $totExp,
        'total_expense_brl' => format_brl($totExp),
        'net' => $net,
        'net_brl' => format_brl($net),
        'available_periods' => get_available_periods($pdo, $config),
    ];
}
