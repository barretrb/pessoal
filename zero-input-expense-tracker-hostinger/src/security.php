<?php
declare(strict_types=1);

const SESSION_COOKIE_NAME = 'expense_tracker_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_SECONDS = 15 * 60;

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

function get_client_ip(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return substr((string)$ip, 0, 64);
}

function check_login_rate_limit(PDO $pdo, string $ip): ?int
{
    $stmt = $pdo->prepare('SELECT attempts, locked_until, updated_at FROM login_attempts WHERE ip = ? LIMIT 1');
    $stmt->execute([$ip]);
    $row = $stmt->fetch();
    if (!$row) {
        return null;
    }
    $now = time();
    if ((int)$row['locked_until'] > $now) {
        return (int)$row['locked_until'] - $now;
    }
    if (($now - (int)$row['updated_at']) > LOGIN_LOCK_SECONDS) {
        clear_login_failures($pdo, $ip);
    }
    return null;
}

function record_login_failure(PDO $pdo, string $ip): void
{
    $now = time();
    $stmt = $pdo->prepare('SELECT attempts, updated_at FROM login_attempts WHERE ip = ? LIMIT 1');
    $stmt->execute([$ip]);
    $row = $stmt->fetch();

    $attempts = 1;
    if ($row && ($now - (int)$row['updated_at']) <= LOGIN_LOCK_SECONDS) {
        $attempts = (int)$row['attempts'] + 1;
    }
    $lockedUntil = $attempts >= LOGIN_MAX_ATTEMPTS ? ($now + LOGIN_LOCK_SECONDS) : 0;

    $upsert = $pdo->prepare(
        'INSERT INTO login_attempts (ip, attempts, locked_until, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(ip) DO UPDATE SET attempts = excluded.attempts, locked_until = excluded.locked_until, updated_at = excluded.updated_at'
    );
    $upsert->execute([$ip, $attempts, $lockedUntil, $now]);
}

function clear_login_failures(PDO $pdo, string $ip): void
{
    $pdo->prepare('DELETE FROM login_attempts WHERE ip = ?')->execute([$ip]);
}
