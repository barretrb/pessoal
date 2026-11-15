<?php
declare(strict_types=1);

const SESSION_COOKIE_NAME = 'expense_tracker_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

function json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function get_header_value(string $name): ?string
{
    $upper = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    if (!empty($_SERVER[$upper])) {
        return trim((string)$_SERVER[$upper]);
    }
    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $k => $v) {
            if (strcasecmp($k, $name) === 0) {
                return trim((string)$v);
            }
        }
    }
    return null;
}

function require_api_key(array $config): void
{
    $provided = get_header_value('X-API-Key');
    if ($provided === null || $provided === '') {
        json_response(['detail' => 'Missing X-API-Key header'], 401);
    }
    if (!hash_equals((string)$config['api_secret_key'], $provided)) {
        json_response(['detail' => 'Invalid X-API-Key'], 403);
    }
}

function create_session_token(array $config): string
{
    $ts = (string)time();
    $sig = hash_hmac('sha256', $ts, (string)$config['api_secret_key']);
    return $ts . '.' . $sig;
}

function is_dashboard_authenticated(array $config): bool
{
    $token = $_COOKIE[SESSION_COOKIE_NAME] ?? null;
    if (!is_string($token) || !str_contains($token, '.')) {
        return false;
    }
    [$ts, $sig] = explode('.', $token, 2);
    if (!ctype_digit($ts) || (time() - (int)$ts) > SESSION_MAX_AGE) {
        return false;
    }
    $expected = hash_hmac('sha256', $ts, (string)$config['api_secret_key']);
    return hash_equals($expected, $sig);
}
