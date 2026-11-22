<?php
declare(strict_types=1);

function telegram_post(array $config, string $method, array $payload): ?array
{
    if (empty($config['telegram_bot_token'])) {
        return null;
    }
    $url = 'https://api.telegram.org/bot' . $config['telegram_bot_token'] . '/' . $method;
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
    ]);
    $raw = curl_exec($ch);
    curl_close($ch);
    if ($raw === false) {
        return null;
    }
    $decoded = json_decode((string)$raw, true);
    return is_array($decoded) ? $decoded : null;
}

function build_top_3_categories(array $config, string $suggested, array $topCategories): array
{
    $candidates = [];
    foreach (array_merge([$suggested], $topCategories) as $cat) {
        $cat = trim((string)$cat);
        if ($cat !== '' && !in_array($cat, $candidates, true)) {
            $candidates[] = $cat;
        }
    }
    foreach ($config['categories'] as $fallback) {
        if (count($candidates) >= 3) {
            break;
        }
        if (!in_array($fallback, $candidates, true)) {
            $candidates[] = $fallback;
        }
    }
    return array_slice($candidates, 0, 3);
}

function send_confirmed_telegram(array $config, float $amount, string $merchant, string $category, float $saldoLivre, ?int $txId = null, bool $isShared = false): ?int
{
    if (empty($config['telegram_chat_id'])) {
        return null;
    }
    $sharedTag = $isShared ? ' [50/50]' : '';
    $text = sprintf(
        '✅ R$ %s em %s%s (%s) | Saldo Livre do Mês: R$ %s',
        format_brl($amount),
        $merchant,
        $sharedTag,
        $category,
        format_brl($saldoLivre)
    );
    $payload = [
        'chat_id' => $config['telegram_chat_id'],
        'text' => $text,
        'disable_notification' => true,
    ];
    if ($txId !== null && $txId > 0) {
        $btnLabel = $isShared ? '↩️ Desfazer 50/50 (100%)' : '👥 Dividir 50/50 (Settle Up)';
        $payload['reply_markup'] = [
            'inline_keyboard' => [
                [
                    ['text' => '✏️ Editar / Categoria', 'callback_data' => "edit:{$txId}"],
                    ['text' => $btnLabel, 'callback_data' => "split:{$txId}"],
                ],
            ],
        ];
    }
    $res = telegram_post($config, 'sendMessage', $payload);
    return ($res && !empty($res['ok'])) ? (int)$res['result']['message_id'] : null;
}

function send_edit_category_keyboard_telegram(
    array $config,
    $chatId,
    int $txId,
    float $amount,
    string $merchant,
    string $currentCategory,
    array $categories,
    ?string $callbackQueryId = null
): void {
    if ($callbackQueryId !== null) {
        telegram_post($config, 'answerCallbackQuery', ['callback_query_id' => $callbackQueryId]);
    }
    $keyboard = [];
    $row = [];
    foreach ($categories as $cat) {
        $row[] = ['text' => $cat, 'callback_data' => "cat:{$txId}:{$cat}"];
        if (count($row) === 3) {
            $keyboard[] = $row;
            $row = [];
        }
    }
    if (!empty($row)) {
        $keyboard[] = $row;
    }
    $instRow = [];
    foreach ([2, 3, 4, 6, 10, 12] as $n) {
        $instRow[] = ['text' => "💳 {$n}x", 'callback_data' => "inst:{$txId}:{$n}"];
    }
    $keyboard[] = $instRow;
    $text = "✏️ *Editar #{$txId}*: R$ " . format_brl($amount) . " em *{$merchant}*\n"
        . "Categoria atual: _{$currentCategory}_\n\n"
        . "Toque em uma categoria, parcele (💳 2x..12x) ou envie:\n"
        . "`/parcelar {$txId} <qtd>` (ex: `/parcelar {$txId} 5`)\n"
        . "`/editar {$txId} Novo Nome | Categoria`\n"
        . "`/excluir {$txId}`";
    telegram_post($config, 'sendMessage', [
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'Markdown',
        'reply_markup' => ['inline_keyboard' => $keyboard],
    ]);
}

function send_hitl_telegram(array $config, int $txId, float $amount, string $merchant, string $txType, array $categories): ?int
{
    if (empty($config['telegram_chat_id'])) {
        return null;
    }
    $label = $txType === 'INCOME' ? 'Entrada' : 'Gasto';
    $text = "🤔 {$label} pendente de confirmação:\n"
        . "💰 R$ " . format_brl($amount) . " em *{$merchant}*\n"
        . "Selecione a categoria correta:";

    $row = [];
    foreach (array_slice($categories, 0, 3) as $cat) {
        $row[] = ['text' => $cat, 'callback_data' => "cat:{$txId}:{$cat}"];
    }
    $keyboard = [$row];
    if ($txType === 'EXPENSE') {
        $keyboard[] = [['text' => '👥 Dividir 50/50 (Settle Up)', 'callback_data' => "split:{$txId}"]];
    }

    $res = telegram_post($config, 'sendMessage', [
        'chat_id' => $config['telegram_chat_id'],
        'text' => $text,
        'parse_mode' => 'Markdown',
        'reply_markup' => ['inline_keyboard' => $keyboard],
    ]);
    return ($res && !empty($res['ok'])) ? (int)$res['result']['message_id'] : null;
}
