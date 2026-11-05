<?php
// Serviços de Integração: Google OAuth, Tasks, Calendar, Groq e Telegram
date_default_timezone_set('America/Sao_Paulo');

function get_config() {
    static $cfg = null;
    if ($cfg === null) {
        $cfg = require __DIR__ . '/config.php';
    }
    return $cfg;
}

// 1. Google OAuth 2.0 (Renovação via Refresh Token com Cache)
function get_google_access_token() {
    $token_file = __DIR__ . '/transient_token.json';
    if (file_exists($token_file)) {
        $cached = json_decode(file_get_contents($token_file), true);
        if ($cached && isset($cached['access_token']) && isset($cached['expires_at'])) {
            if (time() < $cached['expires_at'] - 60) {
                return $cached['access_token'];
            }
        }
    }

    $cfg = get_config()['google'];
    $ch = curl_init('https://oauth2.googleapis.com/token');
    $payload = http_build_query([
        'client_id' => $cfg['client_id'],
        'client_secret' => $cfg['client_secret'],
        'refresh_token' => $cfg['refresh_token'],
        'grant_type' => 'refresh_token'
    ]);

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded']
    ]);

    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status === 200 && $resp) {
        $data = json_decode($resp, true);
        if (isset($data['access_token'])) {
            $data['expires_at'] = time() + ($data['expires_in'] ?? 3600);
            file_put_contents($token_file, json_encode($data));
            return $data['access_token'];
        }
    }
    return null;
}

// 2. Envio de Mensagem no Telegram
function telegram_send($chat_id, $message, $parse_mode = 'Markdown') {
    $cfg = get_config();
    $token = $cfg['telegram_token'];
    $url = "https://api.telegram.org/bot{$token}/sendMessage";

    $payload = [
        'chat_id' => $chat_id,
        'text' => $message,
        'disable_web_page_preview' => true
    ];
    if ($parse_mode) {
        $payload['parse_mode'] = $parse_mode;
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json']
    ]);
    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // Fallback sem markdown caso haja erro de sintaxe (400)
    if ($status === 400 && $parse_mode) {
        unset($payload['parse_mode']);
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json']
        ]);
        curl_exec($ch);
        curl_close($ch);
        return true;
    }
    return ($status >= 200 && $status < 300);
}

// 3. Avaliação Inteligente com Groq AI
function groq_evaluate_input($text) {
    $cfg = get_config();
    $key = $cfg['groq_api_key'];
    $model = $cfg['groq_model'];

    $lower = mb_strtolower(trim($text), 'UTF-8');
    $is_interrogative = (mb_substr(trim($text), -1) === '?') ||
        preg_match('/\b(como|qual|quais|o que|o q|quando|onde|quem|por que|porque|por quê|quanto|quantos|quantas|será|tem|tenho|pra qual|para qual|me diz|me conta)\b/ui', $lower);

    $system_prompt = <<<PROMPT
Você é o motor de inteligência e Coach do Agente "A Única Coisa" (The ONE Thing, de Gary Keller e Jay Papasan).
Sua missão é avaliar a mensagem do usuário (Rafael) e classificá-la rigorosamente em UMA destas 4 categorias:

1. "QUERY_AGENDA_TASKS": O usuário está fazendo qualquer consulta sobre suas tarefas, afazeres, pendências, agenda, reuniões, horários ou calendário (ex: "quantas tarefas eu tenho para amanhã?", "quais tarefas eu tenho?", "como está minha agenda?", "o que tenho pendente?", "tenho reuniões amanhã?", "o que tenho pra fazer?").
2. "TASK": O usuário quer cadastrar ou registrar uma nova tarefa/ação executável a fazer (ex: "comprar café", "enviar proposta para o cliente", "lembrar de pagar boleto do condomínio", "estudar capítulo 4 de inglês", "agendar dentista"). NUNCA classifique uma pergunta como TASK!
3. "COACH_QUESTION": O usuário está fazendo uma pergunta conceitual ou reflexão sobre foco, priorização, o método dominó, time blocking, hábitos ou princípios do livro "A Única Coisa".
4. "INVALID_OR_OFF_TOPIC": Qualquer mensagem totalmente fora do escopo de foco e produtividade (ex: perguntas gerais tipo "qual a capital da França", piadas, futebol, política, notícias gerais, "bom dia tudo bem", correções soltas ou comentários sem contexto).

Diretrizes de resposta:
- Se "QUERY_AGENDA_TASKS": no campo "reply", retorne null.
- Se "TASK": no campo "reply", retorne null. Extraia o título limpo em "clean_title" e o domínio ("PERSONAL" ou "PROFESSIONAL") em "domain".
- Se "COACH_QUESTION": dê uma resposta afiada, direta e prática fundamentada nos ensinamentos do livro (máximo 2 a 3 frases) e OBRIGATORIAMENTE termine fazendo uma pergunta reflexiva de foco estritamente dentro do contexto.
- Se "INVALID_OR_OFF_TOPIC": explique gentilmente e com firmeza que você é um agente de foco exclusivo da metodologia A Única Coisa e gestão de tarefas/agenda, e faça uma pergunta de foco trazendo o usuário de volta para o dominó dele.

Responda SEMPRE em formato JSON estrito:
{
  "category": "QUERY_AGENDA_TASKS" | "TASK" | "COACH_QUESTION" | "INVALID_OR_OFF_TOPIC",
  "clean_title": "string ou null",
  "domain": "PERSONAL" | "PROFESSIONAL" | null,
  "reply": "string ou null"
}
PROMPT;

    $payload = [
        'model' => $model,
        'response_format' => ['type' => 'json_object'],
        'messages' => [
            ['role' => 'system', 'content' => $system_prompt],
            ['role' => 'user', 'content' => $text]
        ],
        'temperature' => 0.1
    ];

    $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$key}",
            'Content-Type: application/json'
        ]
    ]);
    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $parsed = null;
    if ($status === 200 && $resp) {
        $data = json_decode($resp, true);
        if (isset($data['choices'][0]['message']['content'])) {
            $raw_content = trim($data['choices'][0]['message']['content']);
            // Remove code fences se houver
            $raw_content = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $raw_content);
            $parsed = json_decode($raw_content, true);
        }
    }

    if ($parsed && isset($parsed['category'])) {
        // Blindagem de segurança: Uma pergunta NUNCA pode ser classificada como TASK
        if ($parsed['category'] === 'TASK' && $is_interrogative) {
            if (preg_match('/\b(tarefa|task|agenda|reuni|calend|compromisso|pend|fazer|hoje|amanh[aã]|dia)\b/ui', $lower)) {
                $parsed['category'] = 'QUERY_AGENDA_TASKS';
                $parsed['reply'] = null;
            } else {
                $parsed['category'] = 'COACH_QUESTION';
                $parsed['reply'] = "🎯 Essa é uma boa reflexão. Na metodologia de *A Única Coisa*, como esclarecer esse ponto ajuda você a focar na sua prioridade principal de hoje?";
            }
        }
        return $parsed;
    }

    // Fallback Heurístico Robusto (caso a IA falhe ou demore)
    if ($is_interrogative || preg_match('/\b(quantas?|quais|minhas?\s+tarefas|minha\s+agenda|reuni[oõ]es|como\s+est[aá]|o\s+que\s+eu\s+tenho)\b/ui', $lower)) {
        if (preg_match('/\b(tarefa|task|agenda|reuni|calend|compromisso|pend|fazer|hoje|amanh[aã]|dia)\b/ui', $lower)) {
            return ['category' => 'QUERY_AGENDA_TASKS', 'clean_title' => null, 'domain' => null, 'reply' => null];
        }
        return [
            'category' => 'COACH_QUESTION',
            'clean_title' => null,
            'domain' => null,
            'reply' => "🎯 Sou seu mentor de foco no método *A Única Coisa*. Para avançarmos com clareza, qual é a prioridade ou dominó que você precisa derrubar hoje?"
        ];
    }

    if (preg_match('/\b(capital|piada|futebol|clima|tempo\s+hoje|presidente|quem\s+ganhou)\b/ui', $lower)) {
        return [
            'category' => 'INVALID_OR_OFF_TOPIC',
            'clean_title' => null,
            'domain' => null,
            'reply' => "🎯 Meu papel é te ajudar a manter o foco absoluto no método *A Única Coisa* e gerenciar suas tarefas e agenda. Não consigo responder sobre outros temas.\n\n👉 *Qual é a prioridade ou dominó que você quer destravar hoje?*"
        ];
    }

    // Apenas entradas declarativas sem '?' viram TASK
    return [
        'category' => 'TASK',
        'clean_title' => $text,
        'domain' => preg_match('/\b(pessoal|casa|comprar|rem[eé]dio|fam[ií]lia|academia|m[eé]dico|dentista)\b/ui', $lower) ? 'PERSONAL' : 'PROFESSIONAL',
        'reply' => null
    ];
}

// 4. Google Tasks API
function google_tasks_get_list_ids($token) {
    static $list_cache = [];
    if (!empty($list_cache)) return $list_cache;

    $ch = curl_init('https://tasks.googleapis.com/tasks/v1/users/@me/lists');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_HTTPHEADER => ["Authorization: Bearer {$token}"]
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);

    $cfg = get_config()['google']['tasks_lists'];
    $data = json_decode($resp, true);
    $res = ['professional' => null, 'personal' => null];

    if (isset($data['items'])) {
        foreach ($data['items'] as $item) {
            if ($item['title'] === $cfg['professional'] || mb_stripos($item['title'], 'profissional') !== false) {
                $res['professional'] = $item['id'];
            } elseif ($item['title'] === $cfg['personal'] || mb_stripos($item['title'], 'pessoal') !== false) {
                $res['personal'] = $item['id'];
            }
        }
        if (!$res['professional'] && isset($data['items'][0])) $res['professional'] = $data['items'][0]['id'];
        if (!$res['personal'] && isset($data['items'][1])) $res['personal'] = $data['items'][1]['id'];
    }
    $list_cache = $res;
    return $res;
}

function google_tasks_list($token, $domain_key = 'professional') {
    $lists = google_tasks_get_list_ids($token);
    $list_id = $lists[$domain_key] ?? '@default';

    $url = "https://tasks.googleapis.com/tasks/v1/lists/{$list_id}/tasks?showCompleted=false&showHidden=false";
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_HTTPHEADER => ["Authorization: Bearer {$token}"]
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($resp, true);
    return $data['items'] ?? [];
}

function google_tasks_create($token, $domain_key, $title, $notes = '', $due_iso = null) {
    $lists = google_tasks_get_list_ids($token);
    $list_id = $lists[$domain_key] ?? '@default';

    $url = "https://tasks.googleapis.com/tasks/v1/lists/{$list_id}/tasks";
    $body = ['title' => $title, 'notes' => $notes];
    if ($due_iso) {
        $body['due'] = $due_iso;
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($body),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$token}",
            'Content-Type: application/json'
        ]
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);
    return json_decode($resp, true);
}

function google_tasks_complete($token, $domain_key, $task_id) {
    $lists = google_tasks_get_list_ids($token);
    $list_id = $lists[$domain_key] ?? '@default';

    $url = "https://tasks.googleapis.com/tasks/v1/lists/{$list_id}/tasks/{$task_id}";
    $body = ['id' => $task_id, 'status' => 'completed'];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => 'PATCH',
        CURLOPT_POSTFIELDS => json_encode($body),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$token}",
            'Content-Type: application/json'
        ]
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);
    return json_decode($resp, true);
}

function google_tasks_delete($token, $domain_key, $task_id) {
    $lists = google_tasks_get_list_ids($token);
    $list_id = $lists[$domain_key] ?? '@default';

    $url = "https://tasks.googleapis.com/tasks/v1/lists/{$list_id}/tasks/{$task_id}";
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => 'DELETE',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_HTTPHEADER => ["Authorization: Bearer {$token}"]
    ]);
    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ($status >= 200 && $status < 300);
}

// 5. Google Calendar API (24h de Brasília)
function google_calendar_list_events($token, DateTime $target_date) {
    $tz = new DateTimeZone('America/Sao_Paulo');
    $day_str = $target_date->format('Y-m-d');
    $start_of_day = (new DateTime("{$day_str} 00:00:00", $tz))->format(DateTime::RFC3339);
    $end_of_day = (new DateTime("{$day_str} 23:59:59", $tz))->format(DateTime::RFC3339);

    $params = http_build_query([
        'timeMin' => $start_of_day,
        'timeMax' => $end_of_day,
        'singleEvents' => 'true',
        'orderBy' => 'startTime'
    ]);
    $url = "https://www.googleapis.com/calendar/v3/calendars/primary/events?{$params}";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_HTTPHEADER => ["Authorization: Bearer {$token}"]
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($resp, true);
    return $data['items'] ?? [];
}

function google_calendar_create_focus_block($token, $title, DateTime $start_dt, DateTime $end_dt, $invite_email = null) {
    $tz = 'America/Sao_Paulo';
    $cfg = get_config()['google'] ?? [];
    $invite = $invite_email ?? ($cfg['invite_email'] ?? 'rafael.barreto@blip.ai');

    // sendUpdates=all garante que o Google envie o convite e insira o bloco na agenda corporativa
    $url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all';

    $body = [
        'summary' => "🎯 {$title}",
        'description' => "Bloco de foco Deep Work agendado pelo Agente 'A Única Coisa'.",
        'start' => ['dateTime' => $start_dt->format(DateTime::RFC3339), 'timeZone' => $tz],
        'end' => ['dateTime' => $end_dt->format(DateTime::RFC3339), 'timeZone' => $tz],
        'colorId' => '11',
        'reminders' => [
            'useDefault' => false,
            'overrides' => [
                ['method' => 'popup', 'minutes' => 10]
            ]
        ]
    ];

    if ($invite) {
        $body['attendees'] = [
            ['email' => $invite]
        ];
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($body),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$token}",
            'Content-Type: application/json'
        ]
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);
    return json_decode($resp, true);
}
