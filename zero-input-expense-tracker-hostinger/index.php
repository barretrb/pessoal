<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';
require_once __DIR__ . '/src/database.php';
require_once __DIR__ . '/src/security.php';
require_once __DIR__ . '/src/analytics.php';
require_once __DIR__ . '/src/ai_parser.php';
require_once __DIR__ . '/src/telegram_bot.php';
require_once __DIR__ . '/src/planner.php';
require_once __DIR__ . '/src/seed_data.php';
require_once __DIR__ . '/src/views.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$pdo = get_db($config);
seed_annual_plan($pdo);
ensure_month_provision($pdo, $config);

// 1. Health Check
if ($method === 'GET' && $path === '/health') {
    json_response(['status' => 'ok']);
}

// 2. Notification Ingestion Webhook
if ($method === 'POST' && $path === '/api/v1/webhook/notification') {
    require_api_key($config);
    $payload = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($payload) || empty($payload['app']) || empty($payload['text']) || empty($payload['timestamp'])) {
        json_response(['detail' => 'Invalid JSON payload'], 422);
    }

    try {
        $dt = new DateTimeImmutable((string)$payload['timestamp']);
    } catch (Throwable $e) {
        $dt = new DateTimeImmutable('now', new DateTimeZone($config['timezone'] ?: 'UTC'));
    }
    $occurredUtc = $dt->setTimezone(new DateTimeZone('UTC'));
    $occurredIso = $occurredUtc->format('Y-m-d\TH:i:s\Z');

    $usedMemory = false;
    $usedAi = false;

    $memMatch = try_deterministic_memory_match($pdo, $payload);
    if ($memMatch !== null) {
        $extraction = $memMatch['extraction'];
        $usedMemory = true;
        $pdo->prepare('UPDATE merchant_memory SET hit_count = hit_count + 1, updated_at = ? WHERE id = ?')
            ->execute([gmdate('c'), $memMatch['memory_id']]);
    } else {
        try {
            $extraction = parse_notification_with_ai($payload, $config);
        } catch (Throwable $e) {
            json_response(['detail' => 'AI parsing failed: ' . $e->getMessage()], 502);
        }
        $usedAi = true;

        if (!$extraction['is_financial_transaction'] || $extraction['type'] === 'IGNORE' || $extraction['amount'] <= 0) {
            json_response([
                'status' => 'IGNORED',
                'transaction_id' => null,
                'used_memory' => false,
                'used_ai' => true,
                'message' => 'Notification ignored (non-financial, promotional, or declined).',
            ]);
        }

        $mem = find_merchant_memory($pdo, $extraction['merchant']);
        if ($mem !== null) {
            $extraction['suggested_category'] = $mem['category'];
            $extraction['confidence'] = max($extraction['confidence'], 0.95);
            $usedMemory = true;
            $pdo->prepare('UPDATE merchant_memory SET hit_count = hit_count + 1, updated_at = ? WHERE id = ?')
                ->execute([gmdate('c'), $mem['id']]);
        }
    }

    $amount = round((float)$extraction['amount'], 2);

    // Phase 2: Reconcile ROLLING_AVERAGE or deduplicate FIXED_PLAN Cartão in current month
    $localTz = new DateTimeZone($config['timezone'] ?: 'UTC');
    $period = $occurredUtc->setTimezone($localTz)->format('Y-m');
    $matchContext = trim(($extraction['merchant'] ?? '') . ' ' . ($payload['title'] ?? '') . ' ' . ($payload['text'] ?? ''));

    if ($extraction['type'] === 'EXPENSE') {
        $rollingTx = find_matching_rolling_tx($pdo, $matchContext, $period);
        if ($rollingTx !== null) {
            reconcile_transaction_amount($pdo, (int)$rollingTx['id'], $amount);
            json_response([
                'status' => 'CONFIRMED',
                'transaction_id' => (int)$rollingTx['id'],
                'type' => $rollingTx['type'],
                'amount' => $amount,
                'merchant' => $rollingTx['merchant'],
                'category' => $rollingTx['category'],
                'confidence' => 1.0,
                'used_memory' => $usedMemory,
                'used_ai' => $usedAi,
                'message' => 'Reconciled rolling-average bill (ESTIMATED -> CONFIRMED) without duplication.',
            ]);
        }

        $fixedCardTx = find_matching_fixed_card_tx($pdo, $amount, $matchContext, $period);
        if ($fixedCardTx !== null) {
            $pdo->prepare("UPDATE transactions SET amount = ?, status = 'CONFIRMED', app_name = ?, raw_title = ?, raw_text = ? WHERE id = ?")
                ->execute([$amount, (string)$payload['app'], (string)($payload['title'] ?? ''), (string)$payload['text'], (int)$fixedCardTx['id']]);
            json_response([
                'status' => 'DUPLICATE',
                'transaction_id' => (int)$fixedCardTx['id'],
                'type' => $fixedCardTx['type'],
                'amount' => $amount,
                'merchant' => $fixedCardTx['merchant'],
                'category' => $fixedCardTx['category'],
                'confidence' => 1.0,
                'used_memory' => $usedMemory,
                'used_ai' => $usedAi,
                'message' => 'Matched FIXED_PLAN card item within +/- R$ 1.00; confirmed without duplication.',
            ]);
        }
    }

    $winMin = (int)$config['dedup_window_minutes'];
    $winStart = $occurredUtc->modify("-{$winMin} minutes")->format('Y-m-d\TH:i:s\Z');
    $winEnd = $occurredUtc->modify("+{$winMin} minutes")->format('Y-m-d\TH:i:s\Z');

    $dupStmt = $pdo->prepare(
        'SELECT * FROM transactions WHERE ABS(amount - ?) < 0.001 AND type = ? AND occurred_at >= ? AND occurred_at <= ? LIMIT 1'
    );
    $dupStmt->execute([$amount, $extraction['type'], $winStart, $winEnd]);
    $existingDup = $dupStmt->fetch();
    if ($existingDup) {
        json_response([
            'status' => 'DUPLICATE',
            'transaction_id' => (int)$existingDup['id'],
            'type' => $existingDup['type'],
            'amount' => (float)$existingDup['amount'],
            'merchant' => $existingDup['merchant'],
            'category' => $existingDup['category'],
            'confidence' => (float)$existingDup['confidence'],
            'used_memory' => $usedMemory,
            'used_ai' => $usedAi,
            'message' => "Duplicate transaction ignored within {$winMin}-minute window.",
        ]);
    }

    $txStatus = $extraction['confidence'] >= (float)$config['confidence_threshold'] ? 'CONFIRMED' : 'PENDING';
    $merchantDisplay = $extraction['merchant'] !== '' ? $extraction['merchant'] : 'Estabelecimento';
    $merchantNorm = normalize_text($merchantDisplay) ?: 'estabelecimento';

    $ins = $pdo->prepare(
        'INSERT INTO transactions (source, app_name, raw_title, raw_text, type, amount, merchant, merchant_normalized, installments, category, confidence, status, occurred_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $ins->execute([
        'NOTIFICATION',
        (string)$payload['app'],
        (string)($payload['title'] ?? ''),
        (string)$payload['text'],
        $extraction['type'],
        $amount,
        $merchantDisplay,
        $merchantNorm,
        (int)$extraction['installments'],
        $extraction['suggested_category'],
        $extraction['confidence'],
        $txStatus,
        $occurredIso,
        gmdate('Y-m-d\TH:i:s\Z'),
    ]);
    $txId = (int)$pdo->lastInsertId();

    $msgId = null;
    if ($txStatus === 'CONFIRMED') {
        $summary = compute_monthly_summary($pdo, $config);
        $msgId = send_confirmed_telegram($config, $amount, $merchantDisplay, $extraction['suggested_category'], $summary['saldo_livre']);
    } else {
        $top3 = build_top_3_categories($config, $extraction['suggested_category'], $extraction['top_categories']);
        $msgId = send_hitl_telegram($config, $txId, $amount, $merchantDisplay, $extraction['type'], $top3);
    }

    if ($msgId !== null) {
        $pdo->prepare('UPDATE transactions SET telegram_message_id = ? WHERE id = ?')->execute([$msgId, $txId]);
    }

    json_response([
        'status' => $txStatus,
        'transaction_id' => $txId,
        'type' => $extraction['type'],
        'amount' => $amount,
        'merchant' => $merchantDisplay,
        'category' => $extraction['suggested_category'],
        'confidence' => $extraction['confidence'],
        'used_memory' => $usedMemory,
        'used_ai' => $usedAi,
        'message' => "Transaction saved as {$txStatus}.",
    ]);
}

// 3. Telegram Webhook
if ($method === 'POST' && $path === '/api/v1/webhook/telegram') {
    if (!empty($config['telegram_webhook_secret'])) {
        $sec = get_header_value('X-Telegram-Bot-Api-Secret-Token');
        if ($sec === null || !hash_equals((string)$config['telegram_webhook_secret'], $sec)) {
            json_response(['detail' => 'Invalid Telegram webhook secret'], 403);
        }
    }

    $update = json_decode((string)file_get_contents('php://input'), true) ?: [];
    if (!empty($update['callback_query'])) {
        $cb = $update['callback_query'];
        $data = (string)($cb['data'] ?? '');
        $cbId = (string)$cb['id'];
        $chatId = $cb['message']['chat']['id'] ?? null;
        $messageId = $cb['message']['message_id'] ?? null;

        if (str_starts_with($data, 'cat:')) {
            $parts = explode(':', $data, 3);
            if (count($parts) === 3 && ctype_digit($parts[1])) {
                $txId = (int)$parts[1];
                $cat = $parts[2];
                $stmt = $pdo->prepare('SELECT * FROM transactions WHERE id = ? LIMIT 1');
                $stmt->execute([$txId]);
                $tx = $stmt->fetch();
                if ($tx) {
                    $pdo->prepare('UPDATE transactions SET category = ?, status = ? WHERE id = ?')
                        ->execute([$cat, 'CONFIRMED', $txId]);
                    upsert_merchant_memory($pdo, $tx['merchant'], $cat);
                    $summary = compute_monthly_summary($pdo, $config);

                    telegram_post($config, 'answerCallbackQuery', [
                        'callback_query_id' => $cbId,
                        'text' => "Salvo como {$cat}!",
                    ]);
                    if ($chatId !== null && $messageId !== null) {
                        $updatedText = sprintf(
                            '✅ R$ %s em %s (%s) | Saldo Livre do Mês: R$ %s',
                            format_brl((float)$tx['amount']),
                            $tx['merchant'],
                            $cat,
                            format_brl($summary['saldo_livre'])
                        );
                        telegram_post($config, 'editMessageText', [
                            'chat_id' => $chatId,
                            'message_id' => $messageId,
                            'text' => $updatedText,
                        ]);
                    }
                    json_response(['ok' => true, 'transaction_id' => $txId, 'category' => $cat]);
                }
            }
        }
        json_response(['ok' => true, 'ignored' => true]);
    }

    if (!empty($update['message']['text'])) {
        $txt = strtolower(trim((string)$update['message']['text']));
        $chatId = $update['message']['chat']['id'] ?? null;
        if (in_array($txt, ['/saldo', '/resumo'], true) && $chatId !== null) {
            if (empty($config['telegram_chat_id']) || (string)$chatId === (string)$config['telegram_chat_id']) {
                $s = compute_monthly_summary($pdo, $config);
                $reply = "📊 Resumo ({$s['period']})\n"
                    . "Entradas: R$ {$s['total_income_brl']}\n"
                    . "Saídas Fixas: R$ {$s['fixed_expenses_brl']}\n"
                    . "Saídas Variáveis: R$ {$s['variable_expenses_brl']}\n"
                    . "Saldo Livre: R$ {$s['saldo_livre_brl']}";
                telegram_post($config, 'sendMessage', ['chat_id' => $chatId, 'text' => $reply]);
            }
        }
    }
    json_response(['ok' => true]);
}

// 4. Daily Cron
if ($method === 'POST' && $path === '/api/v1/cron/daily') {
    require_api_key($config);
    $targetDate = $_GET['target_date'] ?? null;
    json_response(run_daily_plan_cron($pdo, $config, is_string($targetDate) ? $targetDate : null));
}

// 5. Annual Plan API
if ($path === '/api/v1/annual-plan') {
    require_api_key($config);
    if ($method === 'GET') {
        json_response($pdo->query('SELECT * FROM annual_plan ORDER BY day_of_month ASC')->fetchAll());
    }
    if ($method === 'POST') {
        $b = json_decode((string)file_get_contents('php://input'), true) ?: [];
        $now = gmdate('Y-m-d\TH:i:s\Z');
        $stmt = $pdo->prepare(
            'INSERT INTO annual_plan (title, type, amount, category, day_of_month, start_month, end_month, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            trim((string)($b['title'] ?? '')),
            (string)($b['type'] ?? 'EXPENSE'),
            (float)($b['amount'] ?? 0),
            (string)($b['category'] ?? 'Outros'),
            (int)($b['day_of_month'] ?? 1),
            (int)($b['start_month'] ?? 1),
            (int)($b['end_month'] ?? 12),
            isset($b['active']) ? (int)(bool)$b['active'] : 1,
            $now,
            $now,
        ]);
        $id = (int)$pdo->lastInsertId();
        $row = $pdo->query("SELECT * FROM annual_plan WHERE id = {$id}")->fetch();
        json_response($row ?: [], 201);
    }
}

// 5b. Reconcile & Manual Transaction API
if ($method === 'PATCH' && preg_match('#^/api/v1/transactions/(\d+)/reconcile$#', $path, $m)) {
    require_api_key($config);
    $b = json_decode((string)file_get_contents('php://input'), true) ?: [];
    $amt = (float)($b['amount'] ?? 0);
    if ($amt <= 0) {
        json_response(['detail' => 'Invalid amount'], 422);
    }
    try {
        json_response(reconcile_transaction_amount($pdo, (int)$m[1], $amt));
    } catch (RuntimeException $e) {
        json_response(['detail' => $e->getMessage()], 404);
    }
}

if ($method === 'POST' && $path === '/api/v1/transactions/manual') {
    require_api_key($config);
    $b = json_decode((string)file_get_contents('php://input'), true) ?: [];
    $merchant = trim((string)($b['merchant'] ?? ''));
    $txType = (string)($b['type'] ?? 'INCOME');
    $amt = round((float)($b['amount'] ?? 0), 2);
    $cat = (string)($b['category'] ?? 'Salário/Receita');
    if ($merchant === '' || !in_array($txType, ['INCOME', 'EXPENSE'], true) || $amt <= 0) {
        json_response(['detail' => 'Invalid manual transaction payload'], 422);
    }
    $now = gmdate('Y-m-d\TH:i:s\Z');
    $occ = !empty($b['occurred_at']) ? (new DateTimeImmutable((string)$b['occurred_at']))->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z') : $now;
    $pdo->prepare(
        'INSERT INTO transactions (source, app_name, raw_title, raw_text, type, amount, merchant, merchant_normalized, installments, category, confidence, status, occurred_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1.0, ?, ?, ?)'
    )->execute(['MANUAL', 'Dashboard', $merchant, "Lançamento manual: {$merchant}", $txType, $amt, $merchant, normalize_text($merchant) ?: 'manual', $cat, 'CONFIRMED', $occ, $now]);
    $id = (int)$pdo->lastInsertId();
    $row = $pdo->query("SELECT * FROM transactions WHERE id = {$id}")->fetch();
    json_response($row ?: [], 201);
}

// 6. Auth & Dashboard Web
if ($path === '/' && $method === 'GET') {
    header('Location: /dashboard', true, 302);
    exit;
}

if ($path === '/login' && $method === 'GET') {
    render_login();
}

if ($path === '/login' && $method === 'POST') {
    $ip = get_client_ip();
    $retryAfter = check_login_rate_limit($pdo, $ip);
    if ($retryAfter !== null) {
        $mins = max(1, (int)ceil($retryAfter / 60));
        http_response_code(429);
        header('Retry-After: ' . $retryAfter);
        render_login("Muitas tentativas incorretas. Tente novamente em {$mins} minuto(s).");
    }

    $pass = (string)($_POST['password'] ?? '');
    if (!hash_equals((string)$config['dashboard_password'], $pass)) {
        record_login_failure($pdo, $ip);
        http_response_code(401);
        render_login('Senha incorreta.');
    }
    clear_login_failures($pdo, $ip);
    setcookie(SESSION_COOKIE_NAME, create_session_token($config), [
        'expires' => time() + SESSION_MAX_AGE,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    ]);
    header('Location: /dashboard', true, 303);
    exit;
}

if ($path === '/logout' && $method === 'GET') {
    setcookie(SESSION_COOKIE_NAME, '', ['expires' => time() - 3600, 'path' => '/']);
    header('Location: /login', true, 302);
    exit;
}

if ($path === '/dashboard' && $method === 'GET') {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    $year = null;
    $month = null;
    if (!empty($_GET['month']) && preg_match('/^(\d{4})-(\d{2})$/', (string)$_GET['month'], $m)) {
        $year = (int)$m[1];
        $month = max(1, min(12, (int)$m[2]));
    }
    $summary = compute_monthly_summary($pdo, $config, $year, $month);
    $yearly = compute_yearly_summary($pdo, $config, $summary['year']);
    $plans = $pdo->query('SELECT * FROM annual_plan ORDER BY day_of_month ASC')->fetchAll();
    render_dashboard($summary, $yearly, $plans, $config['categories']);
}

if ($path === '/transactions' && $method === 'GET') {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    $tz = new DateTimeZone($config['timezone'] ?: 'UTC');
    $now = new DateTimeImmutable('now', $tz);
    $filters = [
        'year' => isset($_GET['year']) && $_GET['year'] !== '' ? (int)$_GET['year'] : (int)$now->format('Y'),
        'month' => isset($_GET['month']) && $_GET['month'] !== '' ? (int)$_GET['month'] : (int)$now->format('n'),
        'category' => (string)($_GET['category'] ?? ''),
        'tx_type' => (string)($_GET['tx_type'] ?? ''),
        'source' => (string)($_GET['source'] ?? ''),
        'status' => (string)($_GET['status'] ?? ''),
        'q' => (string)($_GET['q'] ?? ''),
        'min_amount' => (string)($_GET['min_amount'] ?? ''),
        'max_amount' => (string)($_GET['max_amount'] ?? ''),
    ];
    $result = query_detailed_transactions($pdo, $config, $filters);
    render_transactions($result, $config['categories'], $filters);
}

if ($path === '/dashboard/reconcile' && $method === 'POST') {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    $txId = (int)($_POST['transaction_id'] ?? 0);
    $realAmount = (float)($_POST['real_amount'] ?? 0);
    $monthParam = trim((string)($_POST['month'] ?? ''));
    if ($txId > 0 && $realAmount > 0) {
        try {
            reconcile_transaction_amount($pdo, $txId, $realAmount);
        } catch (Throwable $e) {
        }
    }
    $redir = $monthParam !== '' ? '/dashboard?month=' . urlencode($monthParam) : '/dashboard';
    header("Location: {$redir}", true, 303);
    exit;
}

if ($path === '/dashboard/income' && $method === 'POST') {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    $title = trim((string)($_POST['title'] ?? ''));
    $amount = round((float)($_POST['amount'] ?? 0), 2);
    $cat = (string)($_POST['category'] ?? 'Salário/Receita');
    $txType = (string)($_POST['tx_type'] ?? 'INCOME');
    $monthParam = trim((string)($_POST['month'] ?? ''));
    if ($title !== '' && in_array($txType, ['INCOME', 'EXPENSE'], true) && $amount > 0) {
        $now = gmdate('Y-m-d\TH:i:s\Z');
        $occ = $now;
        if (preg_match('/^(\d{4})-(\d{2})$/', $monthParam, $mm)) {
            $day = min((int)date('j'), 28);
            $occ = sprintf('%04d-%02d-%02dT12:00:00Z', (int)$mm[1], (int)$mm[2], $day);
        }
        $pdo->prepare(
            'INSERT INTO transactions (source, app_name, raw_title, raw_text, type, amount, merchant, merchant_normalized, installments, category, confidence, status, occurred_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1.0, ?, ?, ?)'
        )->execute(['MANUAL', 'Dashboard', $title, "Lançamento rápido: {$title}", $txType, $amount, $title, normalize_text($title) ?: 'manual', $cat, 'CONFIRMED', $occ, $now]);
    }
    $redir = $monthParam !== '' ? '/dashboard?month=' . urlencode($monthParam) : '/dashboard';
    header("Location: {$redir}", true, 303);
    exit;
}

if ($path === '/dashboard/plan' && $method === 'POST') {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    $title = trim((string)($_POST['title'] ?? ''));
    $type = (string)($_POST['type'] ?? '');
    $amount = (float)($_POST['amount'] ?? 0);
    $category = (string)($_POST['category'] ?? 'Outros');
    $day = (int)($_POST['day_of_month'] ?? 0);
    $planType = in_array((string)($_POST['plan_type'] ?? 'FIXED'), ['FIXED', 'ROLLING_AVERAGE'], true) ? (string)$_POST['plan_type'] : 'FIXED';
    $paymentMethod = in_array((string)($_POST['payment_method'] ?? 'PIX'), ['PIX', 'Cartão'], true) ? (string)$_POST['payment_method'] : 'PIX';
    if ($title !== '' && in_array($type, ['INCOME', 'EXPENSE'], true) && $amount > 0 && $day >= 1 && $day <= 31) {
        $now = gmdate('Y-m-d\TH:i:s\Z');
        $pdo->prepare(
            'INSERT INTO annual_plan (title, type, plan_type, payment_method, amount, category, day_of_month, start_month, end_month, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, 12, 1, ?, ?)'
        )->execute([$title, $type, $planType, $paymentMethod, $amount, $category, $day, $now, $now]);
    }
    header('Location: /dashboard', true, 303);
    exit;
}

if ($method === 'POST' && preg_match('#^/dashboard/plan/(\d+)/delete$#', $path, $m)) {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    $pdo->prepare('DELETE FROM annual_plan WHERE id = ?')->execute([(int)$m[1]]);
    header('Location: /dashboard', true, 303);
    exit;
}

json_response(['detail' => 'Not found'], 404);
