<?php
declare(strict_types=1);

function normalize_text(string $value): string
{
    $accents = [
        'á'=>'a','à'=>'a','ã'=>'a','â'=>'a','ä'=>'a','é'=>'e','è'=>'e','ê'=>'e','ë'=>'e',
        'í'=>'i','ì'=>'i','î'=>'i','ï'=>'i','ó'=>'o','ò'=>'o','õ'=>'o','ô'=>'o','ö'=>'o',
        'ú'=>'u','ù'=>'u','û'=>'u','ü'=>'u','ç'=>'c','ñ'=>'n',
        'Á'=>'a','À'=>'a','Ã'=>'a','Â'=>'a','Ä'=>'a','É'=>'e','È'=>'e','Ê'=>'e','Ë'=>'e',
        'Í'=>'i','Ì'=>'i','Î'=>'i','Ï'=>'i','Ó'=>'o','Ò'=>'o','Õ'=>'o','Ô'=>'o','Ö'=>'o',
        'Ú'=>'u','Ù'=>'u','Û'=>'u','Ü'=>'u','Ç'=>'c','Ñ'=>'n',
    ];
    $ascii = strtr($value, $accents);
    $cleaned = preg_replace('/[^a-zA-Z0-9\s]/', ' ', strtolower($ascii));
    return trim((string)preg_replace('/\s+/', ' ', (string)$cleaned));
}

function extract_brl_amount(string $text): ?float
{
    if (!preg_match('/R\$\s*([\d\.]+,\d{2})/iu', $text, $m)) {
        return null;
    }
    $val = (float)str_replace(['.', ','], ['', '.'], $m[1]);
    return $val > 0 ? $val : null;
}

function extract_installments(string $text): int
{
    if (preg_match('/(?:em\s+)?(\d{1,2})\s*(?:x|vezes|parcelas?)/iu', $text, $m)) {
        $qty = (int)$m[1];
        if ($qty >= 1 && $qty <= 48) {
            return $qty;
        }
    }
    return 1;
}

function find_merchant_memory(PDO $pdo, string $merchant): ?array
{
    $norm = normalize_text($merchant);
    if ($norm === '') {
        return null;
    }
    $stmt = $pdo->prepare('SELECT * FROM merchant_memory WHERE merchant_normalized = ? LIMIT 1');
    $stmt->execute([$norm]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function upsert_merchant_memory(PDO $pdo, string $merchantDisplay, string $category): void
{
    $norm = normalize_text($merchantDisplay);
    if ($norm === '') {
        return;
    }
    $now = gmdate('c');
    $existing = find_merchant_memory($pdo, $merchantDisplay);
    if ($existing) {
        $stmt = $pdo->prepare(
            'UPDATE merchant_memory SET merchant_display = ?, category = ?, hit_count = hit_count + 1, updated_at = ? WHERE id = ?'
        );
        $stmt->execute([$merchantDisplay, $category, $now, $existing['id']]);
        return;
    }
    $stmt = $pdo->prepare(
        'INSERT INTO merchant_memory (merchant_normalized, merchant_display, category, hit_count, updated_at) VALUES (?, ?, ?, 1, ?)'
    );
    $stmt->execute([$norm, $merchantDisplay, $category, $now]);
}

function try_deterministic_memory_match(PDO $pdo, array $payload): ?array
{
    $combinedRaw = trim(($payload['title'] ?? '') . ' ' . ($payload['text'] ?? ''));
    $combinedNorm = normalize_text($combinedRaw);

    $ignoreHints = [
        'recusada', 'negada', 'cancelada', 'saldo insuficiente', 'fatura fechada',
        'fechamento da fatura', 'vence em', 'promocao', 'desconto', 'oferta',
        'cashback', 'aproveite', 'emprestimo', 'codigo de verificacao', 'token',
    ];
    foreach ($ignoreHints as $hint) {
        if (str_contains($combinedNorm, $hint)) {
            return null;
        }
    }

    $amount = extract_brl_amount($combinedRaw);
    if ($amount === null) {
        return null;
    }

    $incomeHints = ['pix recebido', 'transferencia recebida', 'voce recebeu', 'credito em conta', 'deposito recebido', 'salario', 'reembolso'];
    $expenseHints = ['compra aprovada', 'compra no credito', 'compra no debito', 'pix enviado', 'pagamento aprovado', 'pagamento realizado', 'voce pagou', 'gasto', 'pagou', 'debito'];

    $txType = null;
    foreach ($incomeHints as $hint) {
        if (str_contains($combinedNorm, $hint)) {
            $txType = 'INCOME';
            break;
        }
    }
    if ($txType === null) {
        foreach ($expenseHints as $hint) {
            if (str_contains($combinedNorm, $hint)) {
                $txType = 'EXPENSE';
                break;
            }
        }
    }
    if ($txType === null) {
        return null;
    }

    $memories = $pdo->query('SELECT * FROM merchant_memory')->fetchAll();
    usort($memories, fn($a, $b) => strlen($b['merchant_normalized']) <=> strlen($a['merchant_normalized']));

    foreach ($memories as $mem) {
        $norm = $mem['merchant_normalized'];
        if ($norm !== '' && preg_match('/\b' . preg_quote($norm, '/') . '\b/', $combinedNorm)) {
            return [
                'memory_id' => (int)$mem['id'],
                'extraction' => [
                    'is_financial_transaction' => true,
                    'type' => $txType,
                    'amount' => $amount,
                    'merchant' => $mem['merchant_display'],
                    'installments' => extract_installments($combinedRaw),
                    'suggested_category' => $mem['category'],
                    'confidence' => 0.98,
                    'top_categories' => [$mem['category']],
                ],
            ];
        }
    }

    return null;
}

function build_system_prompt(array $config): string
{
    $cats = implode(', ', $config['categories']);
    return "You are a financial notification parser for Brazilian banks and digital wallets "
        . "(Nubank, Itaú, Inter, Bradesco, Santander, Banco do Brasil, C6, BTG, Mercado Pago, PicPay, Google Pay, Apple Pay).\n"
        . "Extract structured transaction data from the push notification and return ONLY valid JSON.\n\n"
        . "Allowed categories: [{$cats}].\n\n"
        . "JSON schema:\n"
        . "{\n"
        . '  "is_financial_transaction": boolean,' . "\n"
        . '  "type": "EXPENSE" | "INCOME" | "IGNORE",' . "\n"
        . '  "amount": number,' . "\n"
        . '  "merchant": string,' . "\n"
        . '  "installments": integer,' . "\n"
        . '  "suggested_category": string,' . "\n"
        . '  "confidence": number (0.0 to 1.0),' . "\n"
        . '  "top_categories": [string, string, string]' . "\n"
        . "}\n\n"
        . "Rules:\n"
        . "1. Set is_financial_transaction=false and type='IGNORE' for marketing/promos, cashback offers, loan offers, closed invoice notices ('fatura fechada'), declined/cancelled purchases ('compra recusada', 'negada'), or OTP codes.\n"
        . "2. For PIX received / salary / refunds / transfers in, set type='INCOME'.\n"
        . "3. For card purchases, PIX sent, bill payments, set type='EXPENSE'.\n"
        . "4. Extract installments as integer (default 1 if single payment / à vista).\n"
        . "5. Provide top_categories with 3 most likely categories from the allowed list, starting with suggested_category.\n"
        . "6. Set confidence < 0.85 if the merchant name is ambiguous (e.g., generic person name on PIX, unrecognized store, or vague description).\n"
        . "7. Clean up 'merchant' into a short, human-readable establishment name in Title Case (e.g., 'Uber', 'iFood', 'Amazon', 'Supermercado Dia', 'Padaria Central'). Strip card prefixes/codes like 'PG *', 'IFD*', 'MP *', 'MERCADOPAGO*', 'COMPRA APROVADA', 'CARTAO FINAL xxxx', CNPJ, 'LTDA', 'S.A.', city names, and ugly gateway suffixes.";
}

function normalize_ai_extraction(array $parsed): array
{
    $type = strtoupper((string)($parsed['type'] ?? 'IGNORE'));
    if (!in_array($type, ['EXPENSE', 'INCOME', 'IGNORE'], true)) {
        $type = 'IGNORE';
    }
    $installments = (int)($parsed['installments'] ?? 1);
    if ($installments < 1) {
        $installments = 1;
    }
    $amount = max(0.0, (float)($parsed['amount'] ?? 0.0));
    $confidence = max(0.0, min(1.0, (float)($parsed['confidence'] ?? 0.0)));

    return [
        'is_financial_transaction' => (bool)($parsed['is_financial_transaction'] ?? false),
        'type' => $type,
        'amount' => $amount,
        'merchant' => trim((string)($parsed['merchant'] ?? '')),
        'installments' => $installments,
        'suggested_category' => trim((string)($parsed['suggested_category'] ?? 'Outros')) ?: 'Outros',
        'confidence' => $confidence,
        'top_categories' => is_array($parsed['top_categories'] ?? null) ? $parsed['top_categories'] : [],
    ];
}

function curl_post_json(string $url, array $headers, array $body): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_UNICODE),
    ]);
    $raw = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($raw === false || $httpCode < 200 || $httpCode >= 300) {
        throw new RuntimeException("HTTP {$httpCode} calling {$url}: {$err} {$raw}");
    }
    $decoded = json_decode((string)$raw, true);
    if (!is_array($decoded)) {
        throw new RuntimeException("Invalid JSON from {$url}");
    }
    return $decoded;
}

function parse_notification_with_ai(array $payload, array $config): array
{
    $userContent = "App: " . ($payload['app'] ?? '') . "\n"
        . "Title: " . ($payload['title'] ?? '') . "\n"
        . "Text: " . ($payload['text'] ?? '') . "\n"
        . "Timestamp: " . ($payload['timestamp'] ?? '');
    $systemPrompt = build_system_prompt($config);

    if (!empty($config['groq_api_key'])) {
        try {
            $url = rtrim($config['groq_base_url'], '/') . '/chat/completions';
            $data = curl_post_json(
                $url,
                [
                    'Authorization: Bearer ' . $config['groq_api_key'],
                    'Content-Type: application/json',
                ],
                [
                    'model' => $config['groq_model'],
                    'temperature' => 0.0,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userContent],
                    ],
                ]
            );
            $parsed = json_decode((string)($data['choices'][0]['message']['content'] ?? ''), true);
            if (is_array($parsed)) {
                return normalize_ai_extraction($parsed);
            }
        } catch (Throwable $e) {
            if (empty($config['gemini_api_key'])) {
                throw $e;
            }
            error_log('Groq failed, falling back to Gemini: ' . $e->getMessage());
        }
    }

    if (!empty($config['gemini_api_key'])) {
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . $config['gemini_model'] . ':generateContent';
        $data = curl_post_json(
            $url,
            [
                'Content-Type: application/json',
                'X-goog-api-key: ' . $config['gemini_api_key'],
            ],
            [
                'systemInstruction' => ['parts' => [['text' => $systemPrompt]]],
                'contents' => [['parts' => [['text' => $userContent]]]],
                'generationConfig' => [
                    'temperature' => 0.0,
                    'responseMimeType' => 'application/json',
                ],
            ]
        );
        $parsed = json_decode((string)($data['candidates'][0]['content']['parts'][0]['text'] ?? ''), true);
        if (is_array($parsed)) {
            return normalize_ai_extraction($parsed);
        }
    }

    throw new RuntimeException('No AI provider succeeded');
}
