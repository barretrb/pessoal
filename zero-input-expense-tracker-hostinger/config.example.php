<?php
declare(strict_types=1);

return [
    'api_secret_key' => 'troque-por-uma-chave-forte',
    'dashboard_password' => 'admin123',
    'db_path' => __DIR__ . '/data/finance.db',
    'groq_api_key' => '',
    'groq_model' => 'openai/gpt-oss-120b',
    'groq_base_url' => 'https://api.groq.com/openai/v1',
    'gemini_api_key' => '',
    'gemini_model' => 'gemini-flash-latest',
    'telegram_bot_token' => '',
    'telegram_chat_id' => '',
    'telegram_webhook_secret' => '',
    'confidence_threshold' => 0.85,
    'dedup_window_minutes' => 3,
    'monthly_budget_limit' => 0.0,
    'timezone' => 'America/Sao_Paulo',
    'categories' => [
        'Salário/Receita',
        'Contas Fixas',
        'Educação',
        'Saúde/Pet',
        'Mercado/Casa',
        'Alimentação Out',
        'Transporte/Viagem',
        'Software',
        'Shopping',
        'Lazer',
        'Outros',
    ],
];
