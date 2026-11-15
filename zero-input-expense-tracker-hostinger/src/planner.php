<?php
declare(strict_types=1);

function run_daily_plan_cron(PDO $pdo, array $config, ?string $targetDateStr = null): array
{
    $tz = new DateTimeZone($config['timezone'] ?: 'UTC');
    $targetDate = $targetDateStr
        ? new DateTimeImmutable($targetDateStr, $tz)
        : new DateTimeImmutable('now', $tz);

    $year = (int)$targetDate->format('Y');
    $month = (int)$targetDate->format('n');
    $day = (int)$targetDate->format('j');
    $daysInMonth = (int)$targetDate->format('t');
    $period = sprintf('%04d-%02d', $year, $month);

    $occurredUtc = $targetDate->setTime(8, 0, 0)->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
    $nowUtc = gmdate('Y-m-d\TH:i:s\Z');

    $plans = $pdo->query('SELECT * FROM annual_plan WHERE active = 1')->fetchAll();
    $createdIds = [];
    $skippedCount = 0;

    foreach ($plans as $plan) {
        $startM = (int)$plan['start_month'];
        $endM = (int)$plan['end_month'];
        $inRange = ($startM <= $endM)
            ? ($month >= $startM && $month <= $endM)
            : ($month >= $startM || $month <= $endM);

        if (!$inRange) {
            continue;
        }
        $dueDay = min((int)$plan['day_of_month'], $daysInMonth);
        if ($dueDay !== $day) {
            continue;
        }

        $chk = $pdo->prepare('SELECT id FROM transactions WHERE annual_plan_id = ? AND plan_period = ? LIMIT 1');
        $chk->execute([$plan['id'], $period]);
        if ($chk->fetch()) {
            $skippedCount++;
            continue;
        }

        $ins = $pdo->prepare(
            'INSERT INTO transactions (source, app_name, raw_title, raw_text, type, amount, merchant, merchant_normalized, installments, category, confidence, status, occurred_at, annual_plan_id, plan_period, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1.0, ?, ?, ?, ?, ?)'
        );
        $ins->execute([
            'FIXED_PLAN',
            'annual_plan',
            $plan['title'],
            "Lançamento automático do plano anual ({$period})",
            $plan['type'],
            (float)$plan['amount'],
            $plan['title'],
            normalize_text($plan['title']) ?: 'plano_anual',
            $plan['category'],
            'CONFIRMED',
            $occurredUtc,
            $plan['id'],
            $period,
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
