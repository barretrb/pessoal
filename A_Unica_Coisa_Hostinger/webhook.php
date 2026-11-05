<?php
// Webhook do Telegram para o Agente "A Única Coisa" - Hostinger
date_default_timezone_set('America/Sao_Paulo');
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/services.php';

// Responde imediatamente com 200 OK para o Telegram caso seja FastCGI
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
}

$raw = file_get_contents('php://input');
if (!$raw) {
    echo json_encode(['status' => 'ignored', 'reason' => 'Empty payload']);
    exit;
}

$update = json_decode($raw, true);
$message = $update['message'] ?? $update['edited_message'] ?? null;
if (!$message || !isset($message['text'])) {
    echo json_encode(['status' => 'ignored', 'reason' => 'No text message']);
    exit;
}

$chat_id = strval($message['chat']['id']);
$user_text = trim($message['text']);
$lower = mb_strtolower($user_text, 'UTF-8');

$now = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
$state_file = __DIR__ . '/state.json';
$state = file_exists($state_file) ? json_decode(file_get_contents($state_file), true) : [];

// Salva o último chat_id para os crons automáticos saberem para quem enviar
$state['last_chat_id'] = $chat_id;
save_state($state);

function save_state($state) {
    global $state_file;
    file_put_contents($state_file, json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// 1. Comando /start
if ($user_text === '/start') {
    $welcome = "🎯 *Olá! Sou seu Agente 'A Única Coisa'.*\n\n"
        . "Estou conectado diretamente pela sua hospedagem na Hostinger e pronto para blindar seu foco.\n\n"
        . "💬 *O que você pode me dizer a qualquer momento:*\n"
        . "• _'Quais tarefas eu tenho para hoje?'_\n"
        . "• _'Como está minha agenda para amanhã?'_\n"
        . "• _'Meu dominó de hoje é Criar apresentação diretoria'_\n"
        . "• _'Lembrar de pagar condomínio amanhã'_\n"
        . "• _'Finalizei meu dominó de hoje!'_\n\n"
        . "Qual é o seu maior dominó para hoje?";
    telegram_send($chat_id, $welcome);
    echo json_encode(['status' => 'ok', 'action' => 'welcome']);
    exit;
}

// 2. Confirmação de Bloco de Foco ("OK", "Sim", "Agendar")
if (in_array($lower, ['ok', 'ok!', 'sim', 'confirmar', 'confirmo', 'pode agendar', 'agenda', 'beleza'])) {
    $token = get_google_access_token();
    if ($token) {
        $today_str = $now->format('Y-m-d');
        $chosen = $state['daily_history'][$today_str]['chosen_deep_task'] ?? null;
        $title = $chosen['clean_title'] ?? 'Foco Deep Work';
        
        $start_dt = clone $now;
        $start_dt->modify('+15 minutes');
        $end_dt = clone $start_dt;
        $end_dt->modify('+90 minutes');

        google_calendar_create_focus_block($token, $title, $start_dt, $end_dt);
        $reply = "🎯 *Bloco de foco agendado no seu Google Calendar com sucesso!*\n📌 *{$title}* (" . $start_dt->format('H:i') . " às " . $end_dt->format('H:i') . ")\n✉️ *Convidado:* `rafael.barreto@blip.ai`";
    } else {
        $reply = "⚠️ Não consegui conectar ao Google Calendar no momento.";
    }
    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'confirm_focus']);
    exit;
}

// 3. Declaração Explícita de Dominó ("Meu dominó de hoje é X")
if (preg_match('/^(me\s+domin[oó]|meu\s+domin[oó]|meu\s+foco|minha\s+[uú]nica\s+coisa|minha\s+meta)\s*(de\s+hoje)?\s*([eé]|\:)\s*(.+)$/ui', $user_text, $m)) {
    $clean_title = trim($m[4]);
    $domain_key = preg_match('/\b(pessoal|casa|fam[ií]lia|devocional|academia|estudo)\b/ui', $clean_title) ? 'personal' : 'professional';
    $domain_label = $domain_key === 'personal' ? '🏠 Pessoal' : '💼 Profissional';

    $token = get_google_access_token();
    if ($token) {
        google_tasks_create($token, $domain_key, $clean_title, "Dominó do dia definido em " . $now->format('d/m/Y H:i'));
    }

    $today_str = $now->format('Y-m-d');
    $state['daily_history'][$today_str]['chosen_deep_task'] = [
        'clean_title' => $clean_title,
        'domain' => $domain_key
    ];
    save_state($state);

    $reply = "🎯 *Dominó Definido com Sucesso!*\n\n"
        . "Adicionado como seu foco de hoje na lista {$domain_label}:\n"
        . "📌 *{$clean_title}*\n\n"
        . "⚡ _Classificação:_ *DEEP_WORK* (Alavancagem Máxima: 5/5)\n"
        . "*(Responda \"OK\" a qualquer momento se desejar bloquear a agenda)*";
    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'set_domino']);
    exit;
}

// 4. Fechamento Noturno ("concluí o dominó", "conclui", "derrubei")
if (preg_match('/\b(conclu[íi]|derrubei|terminei|feito|fiz)\b/ui', $lower)) {
    $reply = "🏆 *Dominó Concluído com Sucesso!* Parabéns pelo foco de hoje.";
    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'night_checkin']);
    exit;
}

// 5. Avaliação Inteligente com Groq AI
$eval = groq_evaluate_input($user_text);
$category = $eval['category'] ?? 'TASK';

// 6. Roteamento: Consulta de Agenda ou Tarefas
if ($category === 'QUERY_AGENDA_TASKS') {
    // Determina a data alvo respeitando o fuso estrito de Brasília (America/Sao_Paulo)
    if (preg_match('/\b(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])\b/u', $lower, $dm)) {
        $target_dt = clone $now;
        $target_dt->setDate(intval($now->format('Y')), intval($dm[2]), intval($dm[1]));
        $target_label = sprintf('%02d/%02d', $dm[1], $dm[2]);
    } elseif (strpos($lower, 'amanhã') !== false || strpos($lower, 'amanha') !== false) {
        $target_dt = clone $now;
        $target_dt->modify('+1 day');
        $target_label = 'amanhã (' . $target_dt->format('d/m') . ')';
    } elseif (strpos($lower, 'ontem') !== false) {
        $target_dt = clone $now;
        $target_dt->modify('-1 day');
        $target_label = 'ontem (' . $target_dt->format('d/m') . ')';
    } else {
        $target_dt = clone $now;
        $target_label = 'hoje (' . $target_dt->format('d/m') . ')';
    }
    $target_ymd = $target_dt->format('Y-m-d');

    $token = get_google_access_token();
    $replies = [];

    if ($token) {
        // Verifica se a pergunta é sobre tarefas ou ambas
        $asks_tasks = preg_match('/\b(tarefa|task|pend|afazer|fazer|atividade)\b/ui', $lower) || !preg_match('/\b(agenda|reuni|compromisso|calend|evento)\b/ui', $lower);
        $asks_calendar = preg_match('/\b(agenda|reuni|compromisso|calend|evento|hor[aá]rio)\b/ui', $lower) || !preg_match('/\b(tarefa|task|pend|afazer|atividade)\b/ui', $lower);

        // 1. Google Tasks
        if ($asks_tasks) {
            $pro_tasks = google_tasks_list($token, 'professional');
            $pes_tasks = google_tasks_list($token, 'personal');

            $pro_due = [];
            $pro_other = [];
            foreach ($pro_tasks as $t) {
                if (isset($t['due']) && strpos($t['due'], $target_ymd) === 0) {
                    $pro_due[] = $t['title'];
                } else {
                    $pro_other[] = $t['title'];
                }
            }

            $pes_due = [];
            $pes_other = [];
            foreach ($pes_tasks as $t) {
                if (isset($t['due']) && strpos($t['due'], $target_ymd) === 0) {
                    $pes_due[] = $t['title'];
                } else {
                    $pes_other[] = $t['title'];
                }
            }

            $total_due = count($pro_due) + count($pes_due);
            if ($total_due > 0) {
                $replies[] = "📋 *Tarefas com vencimento para {$target_label}:*";
                if (!empty($pro_due)) {
                    $replies[] = "\n💼 *Profissional ({$total_due}):*";
                    foreach ($pro_due as $title) $replies[] = "  • {$title}";
                }
                if (!empty($pes_due)) {
                    $replies[] = "\n🏠 *Pessoal:*";
                    foreach ($pes_due as $title) $replies[] = "  • {$title}";
                }
            } else {
                $replies[] = "📋 *Nenhuma tarefa agendada especificamente para {$target_label}.*";
                // Mostra tarefas ativas do backlog se houver
                if (!empty($pro_other) || !empty($pes_other)) {
                    $replies[] = "\n📌 *Tarefas ativas na sua lista aguardando ação:*";
                    foreach (array_slice($pro_other, 0, 4) as $title) {
                        $replies[] = "  • 💼 {$title}";
                    }
                    foreach (array_slice($pes_other, 0, 3) as $title) {
                        $replies[] = "  • 🏠 {$title}";
                    }
                }
            }
        }

        // 2. Google Calendar
        if ($asks_calendar) {
            $events = google_calendar_list_events($token, $target_dt);
            if (!empty($events)) {
                $replies[] = ($asks_tasks ? "\n" : "") . "📅 *Seus compromissos para {$target_label}:*";
                foreach ($events as $ev) {
                    $summary = $ev['summary'] ?? 'Ocupado';
                    $start_raw = $ev['start']['dateTime'] ?? null;
                    $end_raw = $ev['end']['dateTime'] ?? null;
                    $time_str = '';
                    if ($start_raw && $end_raw) {
                        $s_dt = new DateTime($start_raw);
                        $s_dt->setTimezone(new DateTimeZone('America/Sao_Paulo'));
                        $e_dt = new DateTime($end_raw);
                        $e_dt->setTimezone(new DateTimeZone('America/Sao_Paulo'));
                        $time_str = "*{$s_dt->format('H:i')} - {$e_dt->format('H:i')}:* ";
                    }
                    $replies[] = "  • {$time_str}{$summary}";
                }
            } else {
                $replies[] = ($asks_tasks ? "\n" : "") . "📅 *Sua agenda está totalmente livre para {$target_label}!*";
            }
        }
    } else {
        $replies[] = "⚠️ Não foi possível consultar o Google no momento.";
    }

    $replies[] = "\n🎯 *Qual é A Única Coisa que você precisa garantir para esse dia?*";
    telegram_send($chat_id, implode("\n", $replies));
    echo json_encode(['status' => 'ok', 'action' => 'query_agenda_tasks']);
    exit;
}

// 7. Roteamento: Respostas de Coach ou Fora de Escopo
if ($category === 'COACH_QUESTION' || $category === 'INVALID_OR_OFF_TOPIC') {
    $reply = $eval['reply'] ?? "🎯 Qual é a única coisa mais importante que você pode fazer hoje para avançar seu objetivo principal?";
    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'ai_coach_reply']);
    exit;
}

// 8. Roteamento: Captura de Nova Tarefa Legítima
// Blindagem absoluta: perguntas nunca viram tarefas
if (mb_substr(trim($user_text), -1) === '?' || preg_match('/\b(como|qual|quais|o que|quando|onde|quem|por que|porque|quanto|quantos|quantas|será|tem|tenho)\b/ui', $lower)) {
    $coach_reply = "🎯 Para avançar com foco e clareza: qual é a ação principal ou dominó que você quer destravar hoje?";
    telegram_send($chat_id, $coach_reply);
    echo json_encode(['status' => 'ok', 'action' => 'question_diverted_to_coach']);
    exit;
}

$task_title = $eval['clean_title'] ?? $user_text;
$domain = ($eval['domain'] === 'PERSONAL') ? 'personal' : 'professional';
$domain_label = $domain === 'personal' ? '🏠 Pessoal' : '💼 Profissional';

$due_iso = null;
$due_display = '';
if (strpos($lower, 'amanhã') !== false || strpos($lower, 'amanha') !== false) {
    $d = clone $now;
    $d->modify('+1 day');
    $due_iso = $d->format('Y-m-d') . 'T18:00:00.000Z';
    $due_display = ' para *amanhã*';
}

$token = get_google_access_token();
if ($token) {
    google_tasks_create($token, $domain, $task_title, "Capturado via Telegram em " . $now->format('d/m/Y H:i'), $due_iso);
}

$reply = "✅ Tarefa capturada e adicionada na lista {$domain_label}{$due_display}!\n"
    . "📌 *{$task_title}*";
telegram_send($chat_id, $reply);
echo json_encode(['status' => 'ok', 'action' => 'create_task']);
