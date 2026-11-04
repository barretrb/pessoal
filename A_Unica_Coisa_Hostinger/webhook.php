<?php
// Webhook do Telegram para o Agente "A Única Coisa" - Hostinger
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
        . "• _'Como está minha agenda para hoje?'_\n"
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
        $reply = "🎯 *Bloco de foco agendado no seu Google Calendar com sucesso!*\n📌 *{$title}* (" . $start_dt->format('H:i') . " às " . $end_dt->format('H:i') . ")";
    } else {
        $reply = "⚠️ Não consegui conectar ao Google Calendar no momento.";
    }
    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'confirm_focus']);
    exit;
}

// 3. Consultas de Agenda ou Tarefas ("quantas tarefas...", "como está minha agenda...")
$is_query_tasks = preg_match('/\b(quantas?|quais|listar|ver|o\s+que\s+eu\s+tenho|o\s+que\s+tenho)\b.*\b(tarefas?|tasks?|pend[eê]ncias?|afazeres)\b/ui', $lower)
    || preg_match('/^(minhas\s+tarefas|minhas\s+tasks|meus\s+afazeres|tarefas\s+de\s+hoje|tarefas\s+de\s+amanh[aã])/ui', $lower);

$is_query_calendar = preg_match('/\b(como\s+est[aá]|quais|quantas?|que\s+horas?|me\s+mostre|ver|tenho\s+tempo)\b.*\b(agenda|calend[aá]rio|reuni[aã]o|reuni[oõ]es|compromissos?|eventos?)\b/ui', $lower)
    || preg_match('/^(minha\s+agenda|meu\s+calend[aá]rio|minhas\s+reuni[oõ]es|meus\s+compromissos)/ui', $lower);

if ($is_query_tasks || $is_query_calendar) {
    // Determina a data alvo respeitando o fuso de Brasília
    if (preg_match('/\b(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])\b/u', $lower, $dm)) {
        $target_dt = clone $now;
        $target_dt->setDate(intval($now->format('Y')), intval($dm[2]), intval($dm[1]));
        $target_label = sprintf('%02d/%02d', $dm[1], $dm[2]);
    } elseif (strpos($lower, 'amanhã') !== false || strpos($lower, 'amanha') !== false) {
        $target_dt = clone $now;
        $target_dt->modify('+1 day');
        $target_label = 'amanhã (' . $target_dt->format('d/m') . ')';
    } else {
        $target_dt = clone $now;
        $target_label = 'hoje (' . $target_dt->format('d/m') . ')';
    }
    $target_ymd = $target_dt->format('Y-m-d');

    $token = get_google_access_token();
    $replies = [];

    if ($token) {
        // Tarefas
        if ($is_query_tasks || preg_match('/\b(tarefa|task|pend|afazer)\b/ui', $lower)) {
            $pro_tasks = google_tasks_list($token, 'professional');
            $pes_tasks = google_tasks_list($token, 'personal');

            $pro_due = [];
            foreach ($pro_tasks as $t) {
                if (isset($t['due']) && strpos($t['due'], $target_ymd) === 0) $pro_due[] = $t['title'];
            }
            $pes_due = [];
            foreach ($pes_tasks as $t) {
                if (isset($t['due']) && strpos($t['due'], $target_ymd) === 0) $pes_due[] = $t['title'];
            }

            $total_due = count($pro_due) + count($pes_due);
            if ($total_due > 0) {
                $replies[] = "📋 *Você tem {$total_due} tarefa(s) agendada(s) para {$target_label}:*";
                if (!empty($pro_due)) {
                    $replies[] = "\n💼 *Profissional:*";
                    foreach ($pro_due as $title) $replies[] = "  • {$title}";
                }
                if (!empty($pes_due)) {
                    $replies[] = "\n🏠 *Pessoal:*";
                    foreach ($pes_due as $title) $replies[] = "  • {$title}";
                }
            } else {
                $replies[] = "📋 *Você não possui tarefas com vencimento marcado para {$target_label}.*";
            }
            $other_pro = count($pro_tasks) - count($pro_due);
            $other_pes = count($pes_tasks) - count($pes_due);
            if ($other_pro > 0 || $other_pes > 0) {
                $replies[] = "\n_(Total ativo nas listas: " . count($pro_tasks) . " profissional, " . count($pes_tasks) . " pessoal)_";
            }
        }

        // Agenda
        if ($is_query_calendar || preg_match('/\b(agenda|reuni|compromisso|evento|calend)\b/ui', $lower)) {
            $events = google_calendar_list_events($token, $target_dt);
            if (!empty($events)) {
                $replies[] = "\n📅 *Seus compromissos para {$target_label}:*";
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
                $replies[] = "\n📅 *Sua agenda está totalmente livre para {$target_label}!*";
            }
        }
    } else {
        $replies[] = "⚠️ Não foi possível consultar suas tarefas/agenda no momento.";
    }

    $replies[] = "\n🎯 *Qual é A Única Coisa que você precisa garantir para esse dia?*";
    telegram_send($chat_id, implode("\n", $replies));
    echo json_encode(['status' => 'ok', 'action' => 'query_agenda_tasks']);
    exit;
}

// 4. Declaração Explícita de Dominó ("Meu dominó de hoje é X")
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

// 5. Fechamento Noturno ("concluí o dominó", "conclui", "derrubei")
if (preg_match('/\b(conclu[íi]|derrubei|terminei|feito|fiz)\b/ui', $lower)) {
    $token = get_google_access_token();
    $today_str = $now->format('Y-m-d');
    $chosen = $state['daily_history'][$today_str]['chosen_deep_task'] ?? null;
    $reply = "🏆 *Dominó Concluído com Sucesso!* Parabéns pelo foco de hoje.";
    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'night_checkin']);
    exit;
}

// 6. Avaliação com Groq AI (Coach vs Nova Tarefa vs Inválido)
$eval = groq_evaluate_input($user_text);
$category = $eval['category'] ?? 'TASK';

if ($category === 'COACH_QUESTION' || $category === 'INVALID_OR_OFF_TOPIC') {
    $reply = $eval['reply'] ?? "🎯 Qual é a única coisa mais importante que você pode fazer hoje para avançar seu objetivo principal?";
    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'ai_coach_reply']);
    exit;
}

// 7. Captura de Nova Tarefa Legítima
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
