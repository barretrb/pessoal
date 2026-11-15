<?php
declare(strict_types=1);

function get_default_annual_plan_seed(): array
{
    return [
        // Receita Fixa
        ['title' => 'Salário Líquido', 'type' => 'INCOME', 'plan_type' => 'FIXED', 'payment_method' => 'PIX', 'amount' => 11177.00, 'category' => 'Salário/Receita', 'day_of_month' => 1],
        // Custos Fixos Exatos
        ['title' => 'Inglês', 'type' => 'EXPENSE', 'plan_type' => 'FIXED', 'payment_method' => 'PIX', 'amount' => 650.00, 'category' => 'Educação', 'day_of_month' => 5],
        ['title' => 'Financiamento Apto', 'type' => 'EXPENSE', 'plan_type' => 'FIXED', 'payment_method' => 'PIX', 'amount' => 3161.09, 'category' => 'Contas Fixas', 'day_of_month' => 5],
        ['title' => 'Condomínio', 'type' => 'EXPENSE', 'plan_type' => 'FIXED', 'payment_method' => 'PIX', 'amount' => 1341.21, 'category' => 'Contas Fixas', 'day_of_month' => 5],
        ['title' => 'Plano Cachorro', 'type' => 'EXPENSE', 'plan_type' => 'FIXED', 'payment_method' => 'PIX', 'amount' => 150.00, 'category' => 'Saúde/Pet', 'day_of_month' => 5],
        ['title' => 'Internet', 'type' => 'EXPENSE', 'plan_type' => 'FIXED', 'payment_method' => 'PIX', 'amount' => 100.00, 'category' => 'Contas Fixas', 'day_of_month' => 10],
        ['title' => 'Vivo Conta Celular', 'type' => 'EXPENSE', 'plan_type' => 'FIXED', 'payment_method' => 'PIX', 'amount' => 59.00, 'category' => 'Contas Fixas', 'day_of_month' => 10],
        ['title' => 'Google AI Pro (5 TB)', 'type' => 'EXPENSE', 'plan_type' => 'FIXED', 'payment_method' => 'Cartão', 'amount' => 96.99, 'category' => 'Software', 'day_of_month' => 14],
        ['title' => 'Diarista', 'type' => 'EXPENSE', 'plan_type' => 'FIXED', 'payment_method' => 'PIX', 'amount' => 500.00, 'category' => 'Contas Fixas', 'day_of_month' => 15],
        // Contas de Consumo com Média Móvel
        ['title' => 'Energia (Enel)', 'type' => 'EXPENSE', 'plan_type' => 'ROLLING_AVERAGE', 'payment_method' => 'PIX', 'amount' => 400.00, 'category' => 'Contas Fixas', 'day_of_month' => 10],
        ['title' => 'Naturgy (Gás)', 'type' => 'EXPENSE', 'plan_type' => 'ROLLING_AVERAGE', 'payment_method' => 'PIX', 'amount' => 105.00, 'category' => 'Contas Fixas', 'day_of_month' => 5],
    ];
}

function seed_annual_plan(PDO $pdo): int
{
    $now = gmdate('Y-m-d\TH:i:s\Z');
    $inserted = 0;
    $chk = $pdo->prepare('SELECT id FROM annual_plan WHERE title = ? LIMIT 1');
    $ins = $pdo->prepare(
        'INSERT INTO annual_plan (title, type, plan_type, payment_method, amount, category, day_of_month, start_month, end_month, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 12, 1, ?, ?)'
    );

    foreach (get_default_annual_plan_seed() as $item) {
        $chk->execute([$item['title']]);
        if ($chk->fetch()) {
            continue;
        }
        $ins->execute([
            $item['title'],
            $item['type'],
            $item['plan_type'],
            $item['payment_method'],
            $item['amount'],
            $item['category'],
            $item['day_of_month'],
            $now,
            $now,
        ]);
        $inserted++;
    }
    return $inserted;
}
