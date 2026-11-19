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
require_once __DIR__ . '/src/csv_importer.php';
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
if ($method === 'GET' && in_array($path, ['/showcase', '/manual'], true)) {
    $showcaseFile = __DIR__ . '/docs/FINCONTROL_SHOWCASE.html';
    if (is_file($showcaseFile)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($showcaseFile);
        exit;
    }
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
    $isShared = 0;
    $splitRatio = 1.0;
    $fullAmount = null;

    $settleMatch = try_settle_up_match($pdo, $payload);
    if ($settleMatch !== null) {
        $extraction = $settleMatch['extraction'];
        if (!$extraction['is_financial_transaction'] || $extraction['type'] === 'IGNORE' || $extraction['amount'] <= 0) {
            json_response([
                'status' => 'IGNORED',
                'transaction_id' => null,
                'used_memory' => false,
                'used_ai' => false,
                'message' => 'Settle Up settlement/non-expense ignored.',
            ]);
        }
        $isShared = (int)($extraction['is_shared'] ?? 1);
        $splitRatio = (float)($extraction['split_ratio'] ?? 0.5);
        $fullAmount = (float)($extraction['full_amount'] ?? round($extraction['amount'] * 2.0, 2));
    } else {
        $memMatch = try_deterministic_memory_match($pdo, $payload);
        if ($memMatch !== null) {
            $extraction = $memMatch['extraction'];
            $usedMemory = true;
            $pdo->prepare('UPDATE merchant_memory SET hit_count = hit_count + 1, updated_at = ? WHERE id = ?')
                ->execute([gmdate('c'), $memMatch['memory_id']]);
            $memRowStmt = $pdo->prepare('SELECT default_split_ratio FROM merchant_memory WHERE id = ? LIMIT 1');
            $memRowStmt->execute([$memMatch['memory_id']]);
            $memRow = $memRowStmt->fetch();
            $memSplit = (float)($memRow['default_split_ratio'] ?? 1.0);
            if ($memSplit > 0.0 && $memSplit < 0.99 && $extraction['type'] === 'EXPENSE') {
                $fullAmount = round((float)$extraction['amount'], 2);
                $splitRatio = $memSplit;
                $isShared = 1;
                $extraction['amount'] = round($fullAmount * $splitRatio, 2);
            }
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
                $memSplit = (float)($mem['default_split_ratio'] ?? 1.0);
                if ($memSplit > 0.0 && $memSplit < 0.99 && $extraction['type'] === 'EXPENSE') {
                    $fullAmount = round((float)$extraction['amount'], 2);
                    $splitRatio = $memSplit;
                    $isShared = 1;
                    $extraction['amount'] = round($fullAmount * $splitRatio, 2);
                }
            }
        }
    }

    $amount = round((float)$extraction['amount'], 2);

    // Phase 2a: Refund / Estorno handling — cancel out matching recent EXPENSE without creating bogus records
    $refundNorm = normalize_text(trim((string)($payload['title'] ?? '') . ' ' . (string)$payload['text']));
    $isRefund = false;
    foreach (['estorno', 'estornada', 'estornado', 'compra cancelada', 'cancelamento de compra', 'valor devolvido', 'reembolso de compra'] as $rh) {
        if (str_contains($refundNorm, $rh)) {
            $isRefund = true;
            break;
        }
    }
    if ($isRefund) {
        $merchantNormRef = normalize_text((string)($extraction['merchant'] ?? ''));
        $lookbackIso = $occurredUtc->modify('-30 days')->format('Y-m-d\TH:i:s\Z');
        $upperIso = $occurredUtc->modify('+5 minutes')->format('Y-m-d\TH:i:s\Z');
        $candStmt = $pdo->prepare(
            "SELECT * FROM transactions WHERE type = 'EXPENSE' AND ABS(amount - ?) < 0.01 AND occurred_at >= ? AND occurred_at <= ? ORDER BY occurred_at DESC, id DESC"
        );
        $candStmt->execute([$amount, $lookbackIso, $upperIso]);
        $cands = $candStmt->fetchAll();

        $matchedOrig = null;
        foreach ($cands as $cand) {
            $cNorm = (string)($cand['merchant_normalized'] ?? '');
            if ($merchantNormRef === '' || str_contains($cNorm, $merchantNormRef) || str_contains($merchantNormRef, $cNorm)) {
                $matchedOrig = $cand;
                break;
            }
        }
        if ($matchedOrig === null && !empty($cands)) {
            $dayAgoIso = $occurredUtc->modify('-24 hours')->format('Y-m-d\TH:i:s\Z');
            foreach ($cands as $cand) {
                if ((string)$cand['occurred_at'] >= $dayAgoIso) {
                    $matchedOrig = $cand;
                    break;
                }
            }
        }

        if ($matchedOrig !== null) {
            $origId = (int)$matchedOrig['id'];
            $origMerchant = (string)$matchedOrig['merchant'];
            $origCat = (string)$matchedOrig['category'];
            $pdo->prepare('DELETE FROM transactions WHERE id = ?')->execute([$origId]);
            $summary = compute_monthly_summary($pdo, $config);
            send_confirmed_telegram($config, $amount, "Estorno: {$origMerchant} (compra removida)", $origCat, $summary['saldo_livre']);
            json_response([
                'status' => 'IGNORED',
                'transaction_id' => $origId,
                'type' => 'EXPENSE',
                'amount' => $amount,
                'merchant' => $origMerchant,
                'category' => $origCat,
                'confidence' => 1.0,
                'used_memory' => $usedMemory,
                'used_ai' => $usedAi,
                'message' => 'Refund/estorno matched and removed original expense without creating duplicate records.',
            ]);
        }
        $extraction['type'] = 'INCOME';
    }

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
        'INSERT INTO transactions (source, app_name, raw_title, raw_text, type, amount, merchant, merchant_normalized, installments, category, confidence, status, occurred_at, is_shared, split_ratio, full_amount, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
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
        $isShared,
        $splitRatio,
        $fullAmount ?? $amount,
        gmdate('Y-m-d\TH:i:s\Z'),
    ]);
    $txId = (int)$pdo->lastInsertId();

    $msgId = null;
    if ($txStatus === 'CONFIRMED') {
        $summary = compute_monthly_summary($pdo, $config);
        $msgId = send_confirmed_telegram($config, $amount, $merchantDisplay, $extraction['suggested_category'], $summary['saldo_livre'], $txId, (bool)$isShared);
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
        'is_shared' => (bool)$isShared,
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

        if (str_starts_with($data, 'edit:')) {
            $txIdStr = substr($data, 5);
            if (ctype_digit($txIdStr) && $chatId !== null) {
                $stmt = $pdo->prepare('SELECT * FROM transactions WHERE id = ? LIMIT 1');
                $stmt->execute([(int)$txIdStr]);
                $tx = $stmt->fetch();
                if ($tx) {
                    send_edit_category_keyboard_telegram(
                        $config,
                        $chatId,
                        (int)$tx['id'],
                        (float)$tx['amount'],
                        (string)$tx['merchant'],
                        (string)$tx['category'],
                        get_all_categories($pdo, $config),
                        $cbId
                    );
                    json_response(['ok' => true, 'action' => 'edit_menu', 'transaction_id' => (int)$tx['id']]);
                }
            }
        }

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
                        $isSharedNow = ((int)($tx['is_shared'] ?? 0) === 1);
                        $sharedTag = $isSharedNow ? ' [50/50]' : '';
                        $btnLabel = $isSharedNow ? '↩️ Desfazer 50/50 (100%)' : '👥 Dividir 50/50 (Settle Up)';
                        $updatedText = sprintf(
                            '✅ R$ %s em %s%s (%s) | Saldo Livre do Mês: R$ %s',
                            format_brl((float)$tx['amount']),
                            $tx['merchant'],
                            $sharedTag,
                            $cat,
                            format_brl($summary['saldo_livre'])
                        );
                        telegram_post($config, 'editMessageText', [
                            'chat_id' => $chatId,
                            'message_id' => $messageId,
                            'text' => $updatedText,
                            'reply_markup' => [
                                'inline_keyboard' => [
                                    [['text' => $btnLabel, 'callback_data' => "split:{$txId}"]],
                                ],
                            ],
                        ]);
                    }
                    json_response(['ok' => true, 'transaction_id' => $txId, 'category' => $cat]);
                }
            }
        }

        if (str_starts_with($data, 'split:')) {
            $parts = explode(':', $data, 2);
            if (count($parts) === 2 && ctype_digit($parts[1])) {
                $txId = (int)$parts[1];
                $updatedTx = toggle_transaction_split($pdo, $txId);
                if ($updatedTx) {
                    $isSharedNow = ((int)($updatedTx['is_shared'] ?? 0) === 1);
                    $summary = compute_monthly_summary($pdo, $config);
                    telegram_post($config, 'answerCallbackQuery', [
                        'callback_query_id' => $cbId,
                        'text' => $isSharedNow ? 'Dividido 50/50 (Settle Up)!' : 'Restaurado para 100%!',
                    ]);
                    if ($chatId !== null && $messageId !== null) {
                        $sharedTag = $isSharedNow ? ' [50/50]' : '';
                        $btnLabel = $isSharedNow ? '↩️ Desfazer 50/50 (100%)' : '👥 Dividir 50/50 (Settle Up)';
                        $updatedText = sprintf(
                            '✅ R$ %s em %s%s (%s) | Saldo Livre do Mês: R$ %s',
                            format_brl((float)$updatedTx['amount']),
                            $updatedTx['merchant'],
                            $sharedTag,
                            $updatedTx['category'],
                            format_brl($summary['saldo_livre'])
                        );
                        telegram_post($config, 'editMessageText', [
                            'chat_id' => $chatId,
                            'message_id' => $messageId,
                            'text' => $updatedText,
                            'reply_markup' => [
                                'inline_keyboard' => [
                                    [['text' => $btnLabel, 'callback_data' => "split:{$txId}"]],
                                ],
                            ],
                        ]);
                    }
                    json_response(['ok' => true, 'transaction_id' => $txId, 'is_shared' => $isSharedNow]);
                }
            }
        }
        json_response(['ok' => true, 'ignored' => true]);
    }

    if (!empty($update['message']['text'])) {
        $rawTxt = trim((string)$update['message']['text']);
        $txt = mb_strtolower($rawTxt);
        $chatId = $update['message']['chat']['id'] ?? null;
        if ($chatId !== null && (empty($config['telegram_chat_id']) || (string)$chatId === (string)$config['telegram_chat_id'])) {
            $formatList = function (array $txRows, string $header) {
                if (empty($txRows)) {
                    return [$header . "\nNenhum lançamento encontrado.", []];
                }
                $lines = [$header];
                $kb = [];
                $row = [];
                foreach (array_slice($txRows, 0, 8) as $t) {
                    $sign = $t['type'] === 'INCOME' ? '+' : '-';
                    $dtStr = (new DateTimeImmutable($t['occurred_at'], new DateTimeZone('UTC')))
                        ->setTimezone(new DateTimeZone('America/Sao_Paulo'))->format('d/m');
                    $lines[] = "`#{$t['id']}` {$dtStr} · *{$t['merchant']}* ({$t['category']}) · {$sign}R$ " . format_brl((float)$t['amount']);
                    $shortMerch = mb_substr((string)$t['merchant'], 0, 12);
                    $row[] = ['text' => "✏️ #{$t['id']} {$shortMerch}", 'callback_data' => "edit:{$t['id']}"];
                    if (count($row) === 2) {
                        $kb[] = $row;
                        $row = [];
                    }
                }
                if (!empty($row)) {
                    $kb[] = $row;
                }
                $lines[] = "\n_Toque em um botão para trocar categoria ou envie `/editar ID Nome | Categoria`_";
                return [implode("\n", $lines), $kb];
            };

            if (in_array($txt, ['/saldo', '/resumo'], true)) {
                $s = compute_monthly_summary($pdo, $config);
                $reply = "📊 *Resumo ({$s['period']})*\n"
                    . "Entradas: R$ {$s['total_income_brl']}\n"
                    . "Fixos & Médias: R$ {$s['fixed_expenses_brl']}\n"
                    . "Variáveis (Cartão): R$ {$s['variable_expenses_brl']}\n"
                    . "Saldo Livre: R$ {$s['saldo_livre_brl']}";
                telegram_post($config, 'sendMessage', ['chat_id' => $chatId, 'text' => $reply, 'parse_mode' => 'Markdown']);
                json_response(['ok' => true, 'command' => 'saldo']);
            }

            if (in_array($txt, ['/ultimos', '/listar', '/gastos'], true)) {
                $s = compute_monthly_summary($pdo, $config);
                $res = query_detailed_transactions($pdo, $config, ['year' => $s['year'], 'month' => $s['month']]);
                [$msgTxt, $kb] = $formatList($res['transactions'], "🧾 *Últimos lançamentos ({$s['period']}):*");
                $p = ['chat_id' => $chatId, 'text' => $msgTxt, 'parse_mode' => 'Markdown'];
                if (!empty($kb)) {
                    $p['reply_markup'] = ['inline_keyboard' => $kb];
                }
                telegram_post($config, 'sendMessage', $p);
                json_response(['ok' => true, 'command' => 'ultimos']);
            }

            if (str_starts_with($txt, '/buscar ')) {
                $term = trim(mb_substr($rawTxt, 8));
                $s = compute_monthly_summary($pdo, $config);
                $res = query_detailed_transactions($pdo, $config, ['year' => $s['year'], 'month' => $s['month'], 'q' => $term]);
                [$msgTxt, $kb] = $formatList($res['transactions'], "🔎 *Busca por '{$term}' ({$s['period']}):*");
                $p = ['chat_id' => $chatId, 'text' => $msgTxt, 'parse_mode' => 'Markdown'];
                if (!empty($kb)) {
                    $p['reply_markup'] = ['inline_keyboard' => $kb];
                }
                telegram_post($config, 'sendMessage', $p);
                json_response(['ok' => true, 'command' => 'buscar']);
            }

            if (str_starts_with($txt, '/editar')) {
                $rest = trim(mb_substr($rawTxt, 7));
                $parts = preg_split('/\s+/', $rest, 2);
                if (empty($parts[0]) || !ctype_digit($parts[0])) {
                    telegram_post($config, 'sendMessage', [
                        'chat_id' => $chatId,
                        'text' => "Uso: `/editar <ID> <Novo Nome> | <Categoria>`\nEx: `/editar 18 99 | Transporte/Viagem`\nOu apenas `/editar 18` para escolher categoria.",
                        'parse_mode' => 'Markdown',
                    ]);
                    json_response(['ok' => true, 'command' => 'editar_help']);
                }
                $txIdEdit = (int)$parts[0];
                $st = $pdo->prepare('SELECT * FROM transactions WHERE id = ? LIMIT 1');
                $st->execute([$txIdEdit]);
                $txEdit = $st->fetch();
                if (!$txEdit) {
                    telegram_post($config, 'sendMessage', ['chat_id' => $chatId, 'text' => "❌ Lançamento `#{$txIdEdit}` não encontrado.", 'parse_mode' => 'Markdown']);
                    json_response(['ok' => true, 'command' => 'editar_not_found']);
                }
                if (count($parts) === 1 || trim($parts[1]) === '') {
                    send_edit_category_keyboard_telegram($config, $chatId, $txIdEdit, (float)$txEdit['amount'], (string)$txEdit['merchant'], (string)$txEdit['category'], get_all_categories($pdo, $config));
                    json_response(['ok' => true, 'command' => 'editar_menu']);
                }
                $arg = trim($parts[1]);
                $allCats = get_all_categories($pdo, $config);
                $catMap = [];
                foreach ($allCats as $c) {
                    $catMap[mb_strtolower($c)] = $c;
                }
                $newMerch = (string)$txEdit['merchant'];
                $newCat = (string)$txEdit['category'];
                if (str_contains($arg, '|')) {
                    [$mPart, $cPart] = array_map('trim', explode('|', $arg, 2));
                    if ($mPart !== '') {
                        $newMerch = $mPart;
                    }
                    if ($cPart !== '') {
                        $newCat = $catMap[mb_strtolower($cPart)] ?? ensure_category_exists($pdo, $config, $cPart);
                    }
                } elseif (isset($catMap[mb_strtolower($arg)])) {
                    $newCat = $catMap[mb_strtolower($arg)];
                } else {
                    $newMerch = $arg;
                }
                $pdo->prepare("UPDATE transactions SET merchant = ?, merchant_normalized = ?, category = ?, status = 'CONFIRMED' WHERE id = ?")
                    ->execute([$newMerch, normalize_text($newMerch) ?: 'estabelecimento', $newCat, $txIdEdit]);
                upsert_merchant_memory($pdo, $newMerch, $newCat);
                $s = compute_monthly_summary($pdo, $config);
                telegram_post($config, 'sendMessage', [
                    'chat_id' => $chatId,
                    'text' => "✅ Atualizado `#{$txIdEdit}`: R$ " . format_brl((float)$txEdit['amount']) . " em *{$newMerch}* ({$newCat}) | Saldo Livre: R$ {$s['saldo_livre_brl']}",
                    'parse_mode' => 'Markdown',
                ]);
                json_response(['ok' => true, 'command' => 'editar', 'transaction_id' => $txIdEdit]);
            }

            if (str_starts_with($txt, '/excluir ')) {
                $idStr = trim(mb_substr($rawTxt, 9));
                if (ctype_digit($idStr)) {
                    $st = $pdo->prepare('SELECT * FROM transactions WHERE id = ? LIMIT 1');
                    $st->execute([(int)$idStr]);
                    $txDel = $st->fetch();
                    if ($txDel) {
                        $pdo->prepare('DELETE FROM transactions WHERE id = ?')->execute([(int)$idStr]);
                        $s = compute_monthly_summary($pdo, $config);
                        telegram_post($config, 'sendMessage', [
                            'chat_id' => $chatId,
                            'text' => "🗑️ Excluído `#{$idStr}` ({$txDel['merchant']} - R$ " . format_brl((float)$txDel['amount']) . ") | Saldo Livre: R$ {$s['saldo_livre_brl']}",
                            'parse_mode' => 'Markdown',
                        ]);
                        json_response(['ok' => true, 'command' => 'excluir', 'deleted_id' => (int)$idStr]);
                    }
                }
                telegram_post($config, 'sendMessage', ['chat_id' => $chatId, 'text' => "❌ Lançamento `#{$idStr}` não encontrado.", 'parse_mode' => 'Markdown']);
                json_response(['ok' => true, 'command' => 'excluir_not_found']);
            }

            if (in_array($txt, ['/ajuda', '/help', '/start'], true)) {
                $helpTxt = "🤖 *Comandos do FinControl*\n"
                    . "• `/saldo` — resumo e Saldo Livre do mês\n"
                    . "• `/ultimos` — últimos lançamentos com botão de edição\n"
                    . "• `/buscar <termo>` — buscar gastos (ex: `/buscar 99`)\n"
                    . "• `/editar <ID>` — trocar categoria por botão\n"
                    . "• `/editar <ID> <Nome> | <Categoria>` — renomear e categorizar\n"
                    . "• `/excluir <ID>` — remover lançamento";
                telegram_post($config, 'sendMessage', ['chat_id' => $chatId, 'text' => $helpTxt, 'parse_mode' => 'Markdown']);
                json_response(['ok' => true, 'command' => 'ajuda']);
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
    render_dashboard($summary, $yearly, $plans, get_all_categories($pdo, $config));
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
    render_transactions($result, get_all_categories($pdo, $config), $filters);
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
    $rawCat = (string)($_POST['category'] ?? 'Salário/Receita');
    $newCat = trim((string)($_POST['new_category'] ?? ''));
    $cat = ensure_category_exists($pdo, $config, ($rawCat === '__NEW__' || $newCat !== '') ? $newCat : $rawCat);
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

if ($path === '/api/v1/import/csv' && $method === 'POST') {
    require_api_key($config);
    $b = json_decode((string)file_get_contents('php://input'), true) ?: [];
    $csv = (string)($b['csv'] ?? '');
    $billingMonth = isset($b['billing_month']) && is_string($b['billing_month']) ? trim($b['billing_month']) : null;
    $autoSplitGroceries = !empty($b['auto_split_groceries']);
    if (trim($csv) === '') {
        json_response(['detail' => 'Missing csv content'], 422);
    }
    $res = import_nubank_csv($pdo, $config, $csv, $billingMonth ?: null, $autoSplitGroceries);
    json_response($res);
}

if ($path === '/dashboard/import-csv' && $method === 'POST') {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    $csvContent = '';
    if (!empty($_FILES['csv_file']['tmp_name']) && is_uploaded_file($_FILES['csv_file']['tmp_name'])) {
        $csvContent = (string)file_get_contents($_FILES['csv_file']['tmp_name']);
    }
    if (trim($csvContent) === '') {
        $csvContent = (string)($_POST['csv_text'] ?? '');
    }
    $dateMode = (string)($_POST['date_mode'] ?? 'billing');
    $billingMonth = trim((string)($_POST['billing_month'] ?? ''));
    $targetBilling = ($dateMode === 'billing' && preg_match('/^\d{4}-\d{2}$/', $billingMonth)) ? $billingMonth : null;
    $autoSplitGroceries = !empty($_POST['auto_split_groceries']);

    $res = import_nubank_csv($pdo, $config, $csvContent, $targetBilling, $autoSplitGroceries);
    $redirMonth = $targetBilling ?? ($billingMonth !== '' ? $billingMonth : date('Y-m'));
    $qs = http_build_query([
        'month' => $redirMonth,
        'imp' => $res['imported'],
        'dup' => $res['skipped_duplicates'],
        'ign' => $res['ignored'],
    ]);
    header("Location: /dashboard?{$qs}", true, 303);
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
    $rawCat = (string)($_POST['category'] ?? 'Outros');
    $newCat = trim((string)($_POST['new_category'] ?? ''));
    $category = ensure_category_exists($pdo, $config, ($rawCat === '__NEW__' || $newCat !== '') ? $newCat : $rawCat);
    $day = (int)($_POST['day_of_month'] ?? 0);
    $planType = in_array((string)($_POST['plan_type'] ?? 'FIXED'), ['FIXED', 'ROLLING_AVERAGE'], true) ? (string)$_POST['plan_type'] : 'FIXED';
    $paymentMethod = in_array((string)($_POST['payment_method'] ?? 'PIX'), ['PIX', 'Cartão'], true) ? (string)$_POST['payment_method'] : 'PIX';
    $splitRatio = ((string)($_POST['split_ratio'] ?? '1.0') === '0.5') ? 0.5 : 1.0;
    if ($title !== '' && in_array($type, ['INCOME', 'EXPENSE'], true) && $amount > 0 && $day >= 1 && $day <= 31) {
        $now = gmdate('Y-m-d\TH:i:s\Z');
        $pdo->prepare(
            'INSERT INTO annual_plan (title, type, plan_type, payment_method, amount, category, day_of_month, start_month, end_month, active, split_ratio, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, 12, 1, ?, ?, ?)'
        )->execute([$title, $type, $planType, $paymentMethod, $amount, $category, $day, $splitRatio, $now, $now]);
    }
    header('Location: /dashboard', true, 303);
    exit;
}

if ($method === 'POST' && preg_match('#^/dashboard/plan/(\d+)/toggle-split$#', $path, $m)) {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    $monthParam = trim((string)($_POST['month'] ?? date('Y-m')));
    toggle_plan_split($pdo, (int)$m[1], $monthParam);
    $redir = $monthParam !== '' ? '/dashboard?month=' . urlencode($monthParam) : '/dashboard';
    header("Location: {$redir}", true, 303);
    exit;
}

if ($method === 'POST' && preg_match('#^/dashboard/plan/(\d+)/update$#', $path, $m)) {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    $rawCat = (string)($_POST['category'] ?? '');
    $newCat = trim((string)($_POST['new_category'] ?? ''));
    $cat = ensure_category_exists($pdo, $config, ($rawCat === '__NEW__' || $newCat !== '') ? $newCat : $rawCat);
    $monthParam = trim((string)($_POST['month'] ?? ''));
    if ($cat !== '') {
        $pdo->prepare('UPDATE annual_plan SET category = ?, updated_at = ? WHERE id = ?')
            ->execute([$cat, gmdate('Y-m-d\TH:i:s\Z'), (int)$m[1]]);
    }
    $redir = $monthParam !== '' ? '/dashboard?month=' . urlencode($monthParam) : '/dashboard';
    header("Location: {$redir}", true, 303);
    exit;
}

if ($method === 'POST' && $path === '/dashboard/transactions/bulk-split') {
    if (!is_dashboard_authenticated($config)) {
        json_response(['detail' => 'Unauthorized'], 401);
    }
    $body = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($body)) {
        $body = $_POST;
    }
    $rawIds = $body['ids'] ?? [];
    if (is_string($rawIds)) {
        $rawIds = array_filter(explode(',', $rawIds), fn($v) => $v !== '');
    }
    $mode = (string)($body['mode'] ?? 'half');
    $updatedRows = [];
    if (is_array($rawIds)) {
        foreach ($rawIds as $rawId) {
            if (!is_numeric($rawId)) {
                continue;
            }
            $txId = (int)$rawId;
            if ($txId <= 0) {
                continue;
            }
            if ($mode === 'toggle') {
                $tx = toggle_transaction_split($pdo, $txId);
            } elseif ($mode === 'full') {
                $tx = set_transaction_split($pdo, $txId, 1.0);
            } else {
                $tx = set_transaction_split($pdo, $txId, 0.5);
            }
            if ($tx) {
                $updatedRows[] = [
                    'id' => (int)$tx['id'],
                    'amount' => (float)$tx['amount'],
                    'amount_brl' => format_brl((float)$tx['amount']),
                    'full_amount' => isset($tx['full_amount']) ? (float)$tx['full_amount'] : (float)$tx['amount'],
                    'full_amount_brl' => format_brl(isset($tx['full_amount']) ? (float)$tx['full_amount'] : (float)$tx['amount']),
                    'is_shared' => ((int)($tx['is_shared'] ?? 0) === 1),
                ];
            }
        }
    }
    json_response(['ok' => true, 'updated' => $updatedRows]);
}

if ($method === 'POST' && preg_match('#^/dashboard/transaction/(\d+)/toggle-split$#', $path, $m)) {
    $wantsJson = str_contains((string)($_SERVER['HTTP_ACCEPT'] ?? ''), 'application/json')
        || strtolower((string)($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '')) === 'fetch';
    if (!is_dashboard_authenticated($config)) {
        if ($wantsJson) {
            json_response(['detail' => 'Unauthorized'], 401);
        }
        header('Location: /login', true, 303);
        exit;
    }
    $redirectTo = (string)($_POST['redirect_to'] ?? '/dashboard');
    $alwaysSplit = !empty($_POST['always_split']);
    $updated = toggle_transaction_split($pdo, (int)$m[1]);
    if ($updated && $alwaysSplit) {
        $newRatio = ((int)($updated['is_shared'] ?? 0) === 1) ? 0.5 : 1.0;
        $mem = find_merchant_memory($pdo, (string)$updated['merchant']);
        if ($mem) {
            $pdo->prepare('UPDATE merchant_memory SET default_split_ratio = ?, updated_at = ? WHERE id = ?')
                ->execute([$newRatio, gmdate('c'), (int)$mem['id']]);
        } else {
            upsert_merchant_memory($pdo, (string)$updated['merchant'], (string)$updated['category']);
            $pdo->prepare('UPDATE merchant_memory SET default_split_ratio = ? WHERE merchant_normalized = ?')
                ->execute([$newRatio, normalize_text((string)$updated['merchant'])]);
        }
    }
    if ($wantsJson) {
        if (!$updated) {
            json_response(['detail' => 'Transaction not found'], 404);
        }
        json_response([
            'ok' => true,
            'id' => (int)$updated['id'],
            'amount' => (float)$updated['amount'],
            'amount_brl' => format_brl((float)$updated['amount']),
            'full_amount' => isset($updated['full_amount']) ? (float)$updated['full_amount'] : (float)$updated['amount'],
            'full_amount_brl' => format_brl(isset($updated['full_amount']) ? (float)$updated['full_amount'] : (float)$updated['amount']),
            'is_shared' => ((int)($updated['is_shared'] ?? 0) === 1),
        ]);
    }
    $safeRedir = str_starts_with($redirectTo, '/') ? $redirectTo : '/dashboard';
    header("Location: {$safeRedir}", true, 303);
    exit;
}

if ($method === 'POST' && preg_match('#^/dashboard/transaction/(\d+)/update$#', $path, $m)) {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    $merchant = trim((string)($_POST['merchant'] ?? ''));
    $rawCat = (string)($_POST['category'] ?? '');
    $newCat = trim((string)($_POST['new_category'] ?? ''));
    $cat = ensure_category_exists($pdo, $config, ($rawCat === '__NEW__' || $newCat !== '') ? $newCat : $rawCat);
    $occDate = trim((string)($_POST['occurred_date'] ?? ''));
    $redirectTo = (string)($_POST['redirect_to'] ?? '/dashboard');
    if ($merchant !== '') {
        $norm = normalize_text($merchant) ?: 'estabelecimento';
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $occDate)) {
            $pdo->prepare('UPDATE transactions SET merchant = ?, merchant_normalized = ?, category = ?, occurred_at = ? WHERE id = ?')
                ->execute([$merchant, $norm, $cat, $occDate . 'T15:00:00Z', (int)$m[1]]);
        } else {
            $pdo->prepare('UPDATE transactions SET merchant = ?, merchant_normalized = ?, category = ? WHERE id = ?')
                ->execute([$merchant, $norm, $cat, (int)$m[1]]);
        }
    }
    $safeRedir = str_starts_with($redirectTo, '/') ? $redirectTo : '/dashboard';
    header("Location: {$safeRedir}", true, 303);
    exit;
}

if ($method === 'POST' && preg_match('#^/dashboard/transaction/(\d+)/delete$#', $path, $m)) {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    $pdo->prepare('DELETE FROM transactions WHERE id = ?')->execute([(int)$m[1]]);
    $redirectTo = (string)($_POST['redirect_to'] ?? '/dashboard');
    $safeRedir = str_starts_with($redirectTo, '/') ? $redirectTo : '/dashboard';
    header("Location: {$safeRedir}", true, 303);
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

if ($method === 'POST' && $path === '/dashboard/categories/add') {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    $name = trim((string)($_POST['name'] ?? ''));
    if ($name !== '') {
        ensure_category_exists($pdo, $config, $name);
    }
    $redirectTo = (string)($_POST['redirect_to'] ?? '/dashboard');
    $safeRedir = str_starts_with($redirectTo, '/') ? $redirectTo : '/dashboard';
    header("Location: {$safeRedir}", true, 303);
    exit;
}

if ($method === 'POST' && $path === '/dashboard/categories/rename') {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    get_all_categories($pdo, $config);
    $oldName = trim((string)($_POST['old_name'] ?? ''));
    $newName = mb_substr(trim((string)($_POST['new_name'] ?? '')), 0, 64);
    if ($oldName !== '' && $newName !== '' && $oldName !== $newName) {
        $pdo->prepare('INSERT OR IGNORE INTO categories (name, created_at) VALUES (?, ?)')
            ->execute([$newName, gmdate('Y-m-d\TH:i:s\Z')]);
        $pdo->prepare('DELETE FROM categories WHERE name = ?')->execute([$oldName]);
        $pdo->prepare('UPDATE annual_plan SET category = ? WHERE category = ?')->execute([$newName, $oldName]);
        $pdo->prepare('UPDATE transactions SET category = ? WHERE category = ?')->execute([$newName, $oldName]);
        $pdo->prepare('UPDATE merchant_memory SET category = ? WHERE category = ?')->execute([$newName, $oldName]);
    }
    $redirectTo = (string)($_POST['redirect_to'] ?? '/dashboard');
    $safeRedir = str_starts_with($redirectTo, '/') ? $redirectTo : '/dashboard';
    header("Location: {$safeRedir}", true, 303);
    exit;
}

if ($method === 'POST' && $path === '/dashboard/categories/delete') {
    if (!is_dashboard_authenticated($config)) {
        header('Location: /login', true, 303);
        exit;
    }
    get_all_categories($pdo, $config);
    $name = trim((string)($_POST['name'] ?? ''));
    if ($name !== '' && $name !== 'Outros') {
        $pdo->prepare('DELETE FROM categories WHERE name = ?')->execute([$name]);
        $pdo->prepare("UPDATE annual_plan SET category = 'Outros' WHERE category = ?")->execute([$name]);
        $pdo->prepare("UPDATE transactions SET category = 'Outros' WHERE category = ?")->execute([$name]);
        $pdo->prepare("UPDATE merchant_memory SET category = 'Outros' WHERE category = ?")->execute([$name]);
    }
    $redirectTo = (string)($_POST['redirect_to'] ?? '/dashboard');
    $safeRedir = str_starts_with($redirectTo, '/') ? $redirectTo : '/dashboard';
    header("Location: {$safeRedir}", true, 303);
    exit;
}

json_response(['detail' => 'Not found'], 404);
