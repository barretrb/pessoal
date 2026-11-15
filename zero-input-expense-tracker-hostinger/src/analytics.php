<?php
declare(strict_types=1);

function format_brl(float $value): string
{
    return number_format($value, 2, ',', '.');
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
        if ($tx['status'] !== 'CONFIRMED') {
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

    return [
        'year' => $targetYear,
        'month' => $targetMonth,
        'period' => sprintf('%04d-%02d', $targetYear, $targetMonth),
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
        'transactions' => array_slice($txs, 0, 50),
    ];
}
