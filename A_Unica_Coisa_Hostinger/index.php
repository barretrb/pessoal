<?php
// Status do Agente A Única Coisa - Hostinger
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/services.php';

$token = get_google_access_token();

echo json_encode([
    'status' => 'online',
    'agent' => 'A Única Coisa',
    'hosting' => 'Hostinger',
    'domain' => 'aunicacoisa.reagiu.com.br',
    'google_authenticated' => !empty($token),
    'timezone' => date_default_timezone_get(),
    'current_time' => (new DateTime('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d H:i:s')
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
