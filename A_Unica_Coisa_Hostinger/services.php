<?php
// Serviços de Integração & Engenharia Neuro-Estratégica: Google OAuth, Tasks, Calendar, Groq e Telegram
date_default_timezone_set('America/Sao_Paulo');

function get_config() {
    static $cfg = null;
    if ($cfg === null) {
        $cfg = require __DIR__ . '/config.php';
    }
    return $cfg;
}

// 1. Gestão de Estado Neuro-Estratégico (state.json)
function get_agent_state() {
    $state_file = __DIR__ . '/state.json';
    $tz = new DateTimeZone('America/Sao_Paulo');
    $today_str = (new DateTime('now', $tz))->format('Y-m-d');

    $default = [
        'chat_id' => '5521968746262',
        'current_date' => $today_str,
        'conversation_step' => 'IDLE', // IDLE | AWAITING_DOMINO | AWAITING_CONFIRMATION | AWAITING_TOMORROW_SEED
        'domino_macro' => '',
        'obstaculo_woop' => '',
        'micro_acao_5min' => '',
        'gatilho_se_entao' => '',
        'bunker_checklist' => [
            'Fechar Slack e abas de e-mail',
            'Celular em outro cômodo ou modo foco',
            'Editor de texto em tela cheia',
            'Garrafa de água na mesa'
        ],
        'blocos_sugeridos' => [],
        'status_domino' => 'PENDING', // PENDING | MICRO_DONE | COMPLETED
        'tomorrow_seed' => ''
    ];

    if (!file_exists($state_file)) {
        return $default;
    }

    $raw = json_decode(file_get_contents($state_file), true);
    if (!is_array($raw)) {
        return $default;
    }

    // Compatibilidade com chaves legadas
    if (!isset($raw['chat_id']) && isset($raw['last_chat_id'])) {
        $raw['chat_id'] = $raw['last_chat_id'];
    }

    // Transição de dia: preserva chat_id e tomorrow_seed (que vira semente matinal)
    if (isset($raw['current_date']) && $raw['current_date'] !== $today_str) {
        $raw['current_date'] = $today_str;
        $raw['conversation_step'] = 'IDLE';
        $raw['domino_macro'] = '';
        $raw['obstaculo_woop'] = '';
        $raw['micro_acao_5min'] = '';
        $raw['gatilho_se_entao'] = '';
        $raw['blocos_sugeridos'] = [];
        $raw['status_domino'] = 'PENDING';
        // tomorrow_seed é mantido para o cron das 08h usar como sugestão
    }

    return array_merge($default, $raw);
}

function save_agent_state($state) {
    $state_file = __DIR__ . '/state.json';
    file_put_contents($state_file, json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// 2. Google OAuth 2.0 (Renovação via Refresh Token com Cache)
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

// 3. Envio de Mensagem no Telegram
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

// 4. Router Semântico Inteligente com Groq AI
function groq_evaluate_input($text, $context_step = null) {
    $cfg = get_config();
    $key = $cfg['groq_api_key'];
    $model = $cfg['groq_model'];

    $lower = mb_strtolower(trim($text), 'UTF-8');
    $is_interrogative = (mb_substr(trim($text), -1) === '?') ||
        preg_match('/\b(como|qual|quais|o que|o q|quando|onde|quem|por que|porque|por quê|quanto|quantos|quantas|será|tem|tenho|pra qual|para qual|me diz|me conta)\b/ui', $lower);

    // Atalhos heurísticos para SET_DOMINO
    if (preg_match('/^(me\s+domin[oó]|meu\s+domin[oó]|meu\s+foco|minha\s+[uú]nica\s+coisa|minha\s+meta)\s*(de\s+hoje)?\s*([eé]|\:)\s*(.+)$/ui', $text)) {
        return ['category' => 'SET_DOMINO', 'clean_title' => null, 'domain' => null, 'reply' => null];
    }
    if ($context_step === 'AWAITING_DOMINO' && !$is_interrogative && mb_strlen($text) >= 4) {
        return ['category' => 'SET_DOMINO', 'clean_title' => null, 'domain' => null, 'reply' => null];
    }

    $system_prompt = <<<PROMPT
Você é o Router Semântico e Engenheiro Neuro-Estratégico do Agente "A Única Coisa".
Sua função é classificar a intenção do usuário (Rafael) rigorosamente em UMA das seguintes 5 categorias:

1. "SET_DOMINO": O usuário está definindo, escolhendo ou detalhando qual é a sua Única Coisa / Dominó principal do dia (ex: "Deck de AI em PS, começo às 09h30", "Meu dominó de hoje é Criar apresentação diretoria", "Hoje vou entregar a proposta do cliente X", "Sim, confirmo a de ontem", "Finalizar o doc de arquitetura").
2. "QUERY_AGENDA_TASKS": O usuário está consultando sua agenda, tarefas, calendário, horários ou reuniões (ex: "como está minha agenda hoje?", "quais tarefas eu tenho para amanhã?", "o que tenho pendente?", "tenho reuniões hoje?").
3. "TASK": O usuário está enviando uma tarefa avulsa, lembrete secundário ou ruído para fazer depois (ex: "comprar café", "lembrar de pagar condomínio", "agendar dentista"). NUNCA classifique uma pergunta como TASK!
4. "COACH_QUESTION": O usuário está fazendo uma pergunta conceitual ou reflexão sobre foco, ritmo ultradiano, WOOP, priorização ou o livro "A Única Coisa".
5. "INVALID_OR_OFF_TOPIC": Qualquer mensagem fora do escopo de foco e produtividade (piadas, futebol, política, notícias gerais, "bom dia tudo bem").

Diretrizes:
- Se "SET_DOMINO": no campo "reply", retorne null.
- Se "QUERY_AGENDA_TASKS": no campo "reply", retorne null.
- Se "TASK": no campo "reply", retorne null. Extraia o título em "clean_title" e o domínio ("PERSONAL" ou "PROFESSIONAL") em "domain".
- Se "COACH_QUESTION": responda com Brevidade Inteligente (máximo 2 frases diretas, zero papo motivacional) e termine com 1 pergunta prática.
- Se "INVALID_OR_OFF_TOPIC": explique em 1 frase que seu papel é blindar a execução neuro-estratégica e pergunte qual é o dominó de hoje.

Responda SEMPRE em JSON:
{
  "category": "SET_DOMINO" | "QUERY_AGENDA_TASKS" | "TASK" | "COACH_QUESTION" | "INVALID_OR_OFF_TOPIC",
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
            'Content-Type: application/json',
            'User-Agent: A-Unica-Coisa-Agent/2.0'
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
            $raw_content = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $raw_content);
            $parsed = json_decode($raw_content, true);
        }
    }

    if ($parsed && isset($parsed['category'])) {
        // Blindagem de segurança: Perguntas nunca podem virar TASK
        if ($parsed['category'] === 'TASK' && $is_interrogative) {
            if (preg_match('/\b(tarefa|task|agenda|reuni|calend|compromisso|pend|fazer|hoje|amanh[aã]|dia)\b/ui', $lower)) {
                $parsed['category'] = 'QUERY_AGENDA_TASKS';
                $parsed['reply'] = null;
            } else {
                $parsed['category'] = 'COACH_QUESTION';
                $parsed['reply'] = "🎯 Essa é uma boa reflexão. Na engenharia de foco, como esclarecer esse ponto te ajuda a destravar o dominó de hoje?";
            }
        }
        return $parsed;
    }

    // Fallback Heurístico Robusto
    if ($is_interrogative || preg_match('/\b(quantas?|quais|minhas?\s+tarefas|minha\s+agenda|reuni[oõ]es|como\s+est[aá]|o\s+que\s+eu\s+tenho)\b/ui', $lower)) {
        if (preg_match('/\b(tarefa|task|agenda|reuni|calend|compromisso|pend|fazer|hoje|amanh[aã]|dia)\b/ui', $lower)) {
            return ['category' => 'QUERY_AGENDA_TASKS', 'clean_title' => null, 'domain' => null, 'reply' => null];
        }
        return [
            'category' => 'COACH_QUESTION',
            'clean_title' => null,
            'domain' => null,
            'reply' => "🎯 Foco cirúrgico no método *A Única Coisa*. Para avançarmos sem rodeios, qual é o dominó principal que você vai derrubar hoje?"
        ];
    }

    if (preg_match('/\b(deck|apresenta|proposta|relat[oó]rio|reuni[aã]o|fechamento|arquitetura|cdigo|projeto|onboarding)\b/ui', $lower)) {
        return ['category' => 'SET_DOMINO', 'clean_title' => null, 'domain' => null, 'reply' => null];
    }

    if (preg_match('/\b(capital|piada|futebol|clima|tempo\s+hoje|presidente|quem\s+ganhou)\b/ui', $lower)) {
        return [
            'category' => 'INVALID_OR_OFF_TOPIC',
            'clean_title' => null,
            'domain' => null,
            'reply' => "🎯 Meu papel é blindar sua execução neuro-estratégica e agenda. Sem distrações externas.\n\n👉 *Qual é o seu Dominó principal de hoje?*"
        ];
    }

    return [
        'category' => 'TASK',
        'clean_title' => $text,
        'domain' => preg_match('/\b(pessoal|casa|comprar|rem[eé]dio|fam[ií]lia|academia|m[eé]dico|dentista)\b/ui', $lower) ? 'PERSONAL' : 'PROFESSIONAL',
        'reply' => null
    ];
}

// 5. Motor de Engenharia Neuro-Estratégica (WOOP, Ritmos Ultradianos & Desarme de Fricção)
function groq_engineer_domino($user_text, $current_time_str = '09:00', $seed = null) {
    $cfg = get_config();
    $key = $cfg['groq_api_key'];
    $model = $cfg['groq_model'];

    $system_prompt = <<<PROMPT
Você é o Engenheiro Neuro-Estratégico de Execução do Agente "A Única Coisa".
Sua missão é eliminar a procrastinação, a ambiguidade e o atrito emocional de tarefas complexas usando ciência comportamental de ponta:

1. WOOP & Regulação Emocional (Tim Pychyl): 
   - Identifique o atrito invisível da tarefa e neutralize-o com uma regra prática antitrava. 
   - Reduza o Primeiro Dominó a uma micro-ação de 5 minutos RIDICULAMENTE PEQUENA.
   - REGRA ABSOLUTA: É TERMINANTEMENTE PROIBIDO abrir PowerPoint, Google Slides, Figma ou ferramentas visuais pesadas nos primeiros 5 minutos. A micro-ação deve ser em TEXTO PURO (ex: abrir editor de texto simples e escrever apenas a tese central em 3 bullets, usando [DADO] onde faltar número).

2. Prevenção de Resíduo de Atenção (Sophie Leroy) & Ritmos Ultradianos:
   - Decomponha o entregável em 1 ou 2 blocos separados por modo mental (ex: Bloco 1: Storyline em texto + Dados [45-60 min]; Bloco 2: Montagem Visual/Slides [45-60 min]).
   - Evite misturar raciocínio analítico com design gráfico no mesmo bloco.

3. Intenção de Implementação (Peter Gollwitzer) & Bunker (Wendy Wood):
   - Formule um gatilho prático "SE [Horário/Condição], ENTÃO fecho o Slack, afasto o celular e executo o Primeiro Dominó em texto puro."
   - Inclua checklist de ambiente blindado.

Tom: Brevidade Inteligente (Smart Brevity). Zero papo motivacional, zero clichês, foco cirúrgico na inércia inicial.

Responda OBRIGATORIAMENTE em JSON no seguinte formato:
{
  "domino_macro": "Critério de pronto claro do entregável",
  "obstaculo_woop": "Regra prática antitrava (ex: use [DADO] como placeholder para não travar)",
  "micro_acao_5min": "Micro-ação de 5 min em texto puro (estritamente proibido ferramentas visuais)",
  "gatilho_se_entao": "SE derem [Horário], ENTÃO fecho o Slack, afasto o celular e escrevo 3 bullets em texto puro.",
  "bunker_checklist": [
    "Fechar Slack e abas de e-mail",
    "Celular fora do campo de visão",
    "Editor em tela cheia (modo foco)",
    "Água na mesa"
  ],
  "blocos_sugeridos": [
    {
      "titulo": "Bloco 1: Storyline & Estrutura (Texto)",
      "duracao_min": 45,
      "modo_cognitivo": "Estrutural / Dados",
      "horario_inicio": "HH:MM",
      "horario_fim": "HH:MM"
    },
    {
      "titulo": "Bloco 2: Montagem Visual & Fechamento",
      "duracao_min": 45,
      "modo_cognitivo": "Visual / Montagem",
      "horario_inicio": "HH:MM",
      "horario_fim": "HH:MM"
    }
  ]
}
PROMPT;

    $user_prompt = "Horário de referência: {$current_time_str}.";
    if ($seed) {
        $user_prompt .= " Semente planejada na véspera: '{$seed}'.";
    }
    $user_prompt .= " Entrada do usuário: '{$user_text}'.";

    $payload = [
        'model' => $model,
        'response_format' => ['type' => 'json_object'],
        'messages' => [
            ['role' => 'system', 'content' => $system_prompt],
            ['role' => 'user', 'content' => $user_prompt]
        ],
        'temperature' => 0.2
    ];

    $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$key}",
            'Content-Type: application/json',
            'User-Agent: A-Unica-Coisa-Agent/2.0'
        ]
    ]);
    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status === 200 && $resp) {
        $data = json_decode($resp, true);
        if (isset($data['choices'][0]['message']['content'])) {
            $raw = trim($data['choices'][0]['message']['content']);
            $raw = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $raw);
            $parsed = json_decode($raw, true);
            if ($parsed && isset($parsed['domino_macro'])) {
                return $parsed;
            }
        }
    }

    // Fallback estruturado
    return [
        'domino_macro' => $user_text,
        'obstaculo_woop' => 'Ambiguidade inicial ou falta de dados. Use [DADO] como placeholder e não pare para pesquisar.',
        'micro_acao_5min' => 'Abrir editor de texto simples e escrever apenas 3 bullets com a tese central (proibido abrir ferramentas visuais).',
        'gatilho_se_entao' => "SE for {$current_time_str}, ENTÃO fecho o Slack, coloco o celular no modo foco e escrevo os 3 bullets em texto puro.",
        'bunker_checklist' => [
            'Fechar Slack e abas de e-mail',
            'Celular fora do campo de visão',
            'Editor em tela cheia (modo foco)',
            'Água na mesa'
        ],
        'blocos_sugeridos' => [
            [
                'titulo' => 'Bloco 1: Estrutura & Raciocínio (Texto)',
                'duracao_min' => 45,
                'modo_cognitivo' => 'Estrutural / Texto',
                'horario_inicio' => $current_time_str,
                'horario_fim' => date('H:i', strtotime('+45 minutes', strtotime($current_time_str)))
            ],
            [
                'titulo' => 'Bloco 2: Execução Visual & Refinamento',
                'duracao_min' => 45,
                'modo_cognitivo' => 'Visual / Montagem',
                'horario_inicio' => date('H:i', strtotime('+60 minutes', strtotime($current_time_str))),
                'horario_fim' => date('H:i', strtotime('+105 minutes', strtotime($current_time_str)))
            ]
        ]
    ];
}

// 6. Google Tasks API
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

// 7. Google Calendar API (24h de Brasília & Injeção de Instruções no Evento)
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

function google_calendar_create_focus_block($token, $title, DateTime $start_dt, DateTime $end_dt, $description_extra = '', $invite_email = null) {
    $tz = 'America/Sao_Paulo';
    $cfg = get_config()['google'] ?? [];
    $invite = $invite_email ?? ($cfg['invite_email'] ?? 'rafael.barreto@blip.ai');

    // sendUpdates=all envia o convite e insere o bloco na agenda corporativa Blip
    $url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all';

    $full_desc = "🎯 Bloco de foco Deep Work agendado pelo Agente 'A Única Coisa' (Engenharia Neuro-Estratégica).\n\n"
        . ($description_extra ? "{$description_extra}\n\n" : "")
        . "🛡️ Checklist do Bunker:\n"
        . "• Fechar Slack e abas de e-mail\n"
        . "• Celular fora do campo de visão\n"
        . "• Editor em tela cheia (modo foco)\n"
        . "• Garrafa de água na mesa";

    $body = [
        'summary' => "🎯 {$title}",
        'description' => $full_desc,
        'start' => ['dateTime' => $start_dt->format(DateTime::RFC3339), 'timeZone' => $tz],
        'end' => ['dateTime' => $end_dt->format(DateTime::RFC3339), 'timeZone' => $tz],
        'colorId' => '11', // Vermelho tomate / destaque visual no Google Calendar
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
