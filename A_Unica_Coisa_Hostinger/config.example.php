<?php
// Configuração de Exemplo do Agente A Única Coisa - Hostinger
date_default_timezone_set('America/Sao_Paulo');

return [
    'telegram_token' => 'YOUR_TELEGRAM_BOT_TOKEN',
    'groq_api_key' => 'YOUR_GROQ_API_KEY',
    'groq_model' => 'openai/gpt-oss-120b',
    'google' => [
        'client_id' => 'YOUR_GOOGLE_CLIENT_ID',
        'client_secret' => 'YOUR_GOOGLE_CLIENT_SECRET',
        'refresh_token' => 'YOUR_GOOGLE_REFRESH_TOKEN',
        'tasks_lists' => [
            'professional' => '💼 Profissional',
            'personal' => '🏠 Pessoal'
        ]
    ]
];
