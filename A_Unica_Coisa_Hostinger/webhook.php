<?php
// Webhook do Telegram para o Agente "A Única Coisa" - Hostinger
// Filosofia: Engenharia de Execução Neuro-Estratégica (WOOP, Ritmos Ultradianos, Zeigarnik, Implementação)
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
$state = get_agent_state();
$state['chat_id'] = $chat_id;
save_agent_state($state);

// 1. Comando /start
if ($user_text === '/start') {
    $welcome = "🎯 *Agente 'A Única Coisa' — Engenharia Neuro-Estratégica*\n\n"
        . "Estou conectado diretamente pela Hostinger e pronto para blindar seu foco e eliminar o atrito de execução.\n\n"
        . "💬 *Comandos rápidos a qualquer momento:*\n"
        . "• _'Deck de AI em PS, começo às 09h30'_ (Gera plano com WOOP e divide blocos)\n"
        . "• _'Quais tarefas eu tenho para hoje?'_\n"
        . "• _'Como está minha agenda para amanhã?'_\n"
        . "• _'Fiz a de 5 min!'_ (Registra destrave de inércia)\n"
        . "• _'Concluí o dominó!'_ (Fechamento Zeigarnik do dia)\n\n"
        . "Qual é a sua ÚNICA entrega principal de hoje?";
    telegram_send($chat_id, $welcome);
    echo json_encode(['status' => 'ok', 'action' => 'welcome']);
    exit;
}

// 2. Fechamento Zeigarnik: Semente para o dia seguinte (tomorrow_seed)
if ($state['conversation_step'] === 'AWAITING_TOMORROW_SEED' || preg_match('/^(alvo\s+de\s+amanh[aã]|amanh[aã]\s+[eé]|amanh[aã]\s+vou|semente\s+de\s+amanh[aã]|alvo\:)\s*(.+)$/ui', $user_text, $sm)) {
    $seed_title = isset($sm[2]) ? trim($sm[2]) : $user_text;
    $state['tomorrow_seed'] = $seed_title;
    $state['conversation_step'] = 'IDLE';
    save_agent_state($state);

    $reply = "🌙 *Semente de amanhã arquivada com sucesso:*\n📌 *{$seed_title}*\n\n"
        . "🧠 Memória de trabalho (RAM) liberada para a noite. Descanse sem resíduo de atenção até o ritual das 08h00!";
    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'tomorrow_seed_saved']);
    exit;
}

// 3. Regulação Emocional: Registro de Inércia Rompida ("Fiz a de 5 min")
if (preg_match('/\b(fiz\s+a\s+de\s+5|micro\s+feita|destravei|rompi\s+a\s+in[eé]rcia|comecei\s+o\s+bloco|primeiro\s+domin[oó]\s+caiu)\b/ui', $lower)) {
    $state['status_domino'] = 'MICRO_DONE';
    save_agent_state($state);

    $reply = "🔥 *O Primeiro Dominó caiu!* A inércia inicial foi vencida e o atrito emocional foi zerado.\n\n"
        . "🛡️ Mantenha-se no Bunker até o fim do bloco atual. Proibido alternar para abas visuais ou Slack antes do fechamento mental do Bloco 1.";
    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'micro_action_done']);
    exit;
}

// 4. Fechamento Noturno sem Julgamento Moral (Efeito Zeigarnik + Autocompaixão)
if (preg_match('/\b(conclu[íi]|derrubei|caiu|feito|finalizei|completei)\b/ui', $lower) && !preg_match('/\b(tarefa|task)\b/ui', $lower)) {
    $state['status_domino'] = 'COMPLETED';
    $state['conversation_step'] = 'AWAITING_TOMORROW_SEED';
    save_agent_state($state);

    $reply = "🏆 *Dominó do dia derrubado com sucesso!* Excelente trabalho de alavancagem.\n\n"
        . "🧠 *Para desligar sua memória de trabalho esta noite (Efeito Zeigarnik):*\n"
        . "Em 1 linha: qual será o seu alvo principal de amanhã?";
    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'night_completed']);
    exit;
}

if (preg_match('/\b(n[aã]o\s+deu|travou|empacou|n[aã]o\s+consegui|falhei)\b/ui', $lower)) {
    $state['status_domino'] = 'PENDING';
    $state['conversation_step'] = 'AWAITING_TOMORROW_SEED';
    save_agent_state($state);

    $reply = "🤝 *Registro salvo sem culpa nem julgamento moral.* Tarefas complexas geram atrito cognitivo natural.\n\n"
        . "🧠 *Para liberar sua memória RAM e desconectar:* em 1 linha, qual será o seu alvo principal de amanhã para fatiarmos o limiar de ativação?";
    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'night_friction_logged']);
    exit;
}

// 5. Confirmação de Blocos Blindados no Google Calendar ("OK", "Sim", "Agendar")
if (in_array($lower, ['ok', 'ok!', 'sim', 'confirmar', 'confirmo', 'pode agendar', 'agenda', 'beleza', 'combinado', 'agende'])) {
    $token = get_google_access_token();
    if ($token && !empty($state['blocos_sugeridos'])) {
        $created_summaries = [];
        foreach ($state['blocos_sugeridos'] as $bloco) {
            $h_inicio = $bloco['horario_inicio'] ?? $now->format('H:i');
            $duracao = intval($bloco['duracao_min'] ?? 45);

            // Cria DateTime para hoje no horário sugerido
            $start_dt = clone $now;
            if (preg_match('/^(\d{1,2}):(\d{2})$/', $h_inicio, $hm)) {
                $start_dt->setTime(intval($hm[1]), intval($hm[2]), 0);
                // Se o horário já passou há mais de 10 minutos, agenda para daqui a 5 minutos
                if ($start_dt->getTimestamp() < ($now->getTimestamp() - 600)) {
                    $start_dt = (clone $now)->modify('+5 minutes');
                }
            } else {
                $start_dt = (clone $now)->modify('+10 minutes');
            }

            $end_dt = (clone $start_dt)->modify("+{$duracao} minutes");

            $desc_extra = "🚀 PRIMEIRO DOMINÓ (5 MIN):\n{$state['micro_acao_5min']}\n\n"
                . "🔓 REGRA ANTITRAVA (WOOP):\n{$state['obstaculo_woop']}\n\n"
                . "⏱️ MODO COGNITIVO:\n" . ($bloco['modo_cognitivo'] ?? 'Foco Profundo');

            google_calendar_create_focus_block($token, $bloco['titulo'], $start_dt, $end_dt, $desc_extra, 'rafael.barreto@blip.ai');
            $created_summaries[] = "• *{$bloco['titulo']}* (" . $start_dt->format('H:i') . " às " . $end_dt->format('H:i') . ")";
        }

        $reply = "🎯 *Bloco(s) blindado(s) no seu Google Calendar com sucesso!*\n\n"
            . implode("\n", $created_summaries) . "\n\n"
            . "✉️ *Convidado corporativo:* `rafael.barreto@blip.ai`\n\n"
            . "💡 *Instrução em tela:* A descrição de cada evento na sua agenda já contém o seu *Primeiro Dominó de 5 minutos* e o *Checklist do Bunker*. Quando o alarme tocar, execute a micro-ação sem pensar!";
        $state['conversation_step'] = 'IDLE';
        save_agent_state($state);
    } elseif ($token && !empty($state['domino_macro'])) {
        $start_dt = (clone $now)->modify('+10 minutes');
        $end_dt = (clone $start_dt)->modify('+90 minutes');
        google_calendar_create_focus_block($token, $state['domino_macro'], $start_dt, $end_dt, "Primeiro Dominó: {$state['micro_acao_5min']}", 'rafael.barreto@blip.ai');
        $reply = "🎯 *Bloco blindado no seu Google Calendar!*\n📌 *{$state['domino_macro']}* (" . $start_dt->format('H:i') . " às " . $end_dt->format('H:i') . ")\n✉️ Convidado: `rafael.barreto@blip.ai`";
        $state['conversation_step'] = 'IDLE';
        save_agent_state($state);
    } else {
        $reply = "⚠️ Não encontrei blocos pendentes de confirmação. Qual é o seu Dominó de hoje?";
    }

    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'confirm_focus']);
    exit;
}

// 6. Router Semântico Inteligente (Groq AI)
$eval = groq_evaluate_input($user_text, $state['conversation_step']);
$category = $eval['category'] ?? 'TASK';

// 7. Roteamento: Definição / Engenharia do Dominó (SET_DOMINO)
if ($category === 'SET_DOMINO') {
    $plan = groq_engineer_domino($user_text, $now->format('H:i'), $state['tomorrow_seed'] ?? null);

    $state['domino_macro'] = $plan['domino_macro'];
    $state['obstaculo_woop'] = $plan['obstaculo_woop'];
    $state['micro_acao_5min'] = $plan['micro_acao_5min'];
    $state['gatilho_se_entao'] = $plan['gatilho_se_entao'];
    $state['bunker_checklist'] = $plan['bunker_checklist'] ?? [];
    $state['blocos_sugeridos'] = $plan['blocos_sugeridos'] ?? [];
    $state['status_domino'] = 'PENDING';
    $state['conversation_step'] = 'AWAITING_CONFIRMATION';
    save_agent_state($state);

    // Salva o dominó macro no topo da lista Profissional no Google Tasks
    $token = get_google_access_token();
    if ($token) {
        google_tasks_create($token, 'professional', $plan['domino_macro'], "Dominó Neuro-Estratégico definido em " . $now->format('d/m/Y H:i') . "\nPrimeiro dominó: " . $plan['micro_acao_5min']);
    }

    $blocos_txt = [];
    foreach ($plan['blocos_sugeridos'] as $b) {
        $blocos_txt[] = "  • *" . $b['titulo'] . "* (" . $b['duracao_min'] . " min) [" . $b['horario_inicio'] . " às " . $b['horario_fim'] . "]";
    }

    $bunker_summary = implode(" | ", array_slice($plan['bunker_checklist'], 0, 3));

    $reply = "🎯 *Plano de Execução Neuro-Estratégico*\n\n"
        . "🎯 *Alvo Principal (Critério de Pronto):*\n"
        . "{$plan['domino_macro']}\n\n"
        . "🔓 *Desarme de Fricção (WOOP):*\n"
        . "_{$plan['obstaculo_woop']}_\n\n"
        . "🚀 *Primeiro Dominó (Ação de 5 min — Proibido ferramentas visuais):*\n"
        . "*{$plan['micro_acao_5min']}*\n\n"
        . "⏱️ *Arquitetura de Blocos (Sem Resíduo de Atenção):*\n"
        . implode("\n", $blocos_txt) . "\n\n"
        . "🛡️ *Gatilho & Bunker:*\n"
        . "\"{$plan['gatilho_se_entao']}\"\n"
        . "_(Bunker: {$bunker_summary})_\n\n"
        . "👉 *Responda \"OK\" para blindar esses blocos no Google Calendar (com convite para rafael.barreto@blip.ai).*";

    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'engineer_domino']);
    exit;
}

// 8. Roteamento: Consulta de Agenda ou Tarefas
if ($category === 'QUERY_AGENDA_TASKS') {
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
        $asks_tasks = preg_match('/\b(tarefa|task|pend|afazer|fazer|atividade)\b/ui', $lower) || !preg_match('/\b(agenda|reuni|compromisso|calend|evento)\b/ui', $lower);
        $asks_calendar = preg_match('/\b(agenda|reuni|compromisso|calend|evento|hor[aá]rio)\b/ui', $lower) || !preg_match('/\b(tarefa|task|pend|afazer|atividade)\b/ui', $lower);

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

// 9. Roteamento: Respostas de Orientação Neuro-Estratégica ou Fora de Escopo
if ($category === 'COACH_QUESTION' || $category === 'INVALID_OR_OFF_TOPIC') {
    $reply = $eval['reply'] ?? "🎯 Qual é a única coisa mais importante que você pode fazer hoje para avançar seu objetivo principal?";
    telegram_send($chat_id, $reply);
    echo json_encode(['status' => 'ok', 'action' => 'ai_coach_reply']);
    exit;
}

// 10. Roteamento: Captura de Tarefa Avulsa (Regra Zeigarnik de Caixa de Ruído)
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
if (strpos($lower, 'amanhã') !== false || strpos($lower, 'amanha') !== false) {
    $d = clone $now;
    $d->modify('+1 day');
    $due_iso = $d->format('Y-m-d') . 'T18:00:00.000Z';
}

$token = get_google_access_token();
if ($token) {
    google_tasks_create($token, $domain, $task_title, "Capturado via Telegram em " . $now->format('d/m/Y H:i'), $due_iso);
}

// Regra Zeigarnik: Se estiver durante o dia e com dominó pendente, protege a memória de trabalho
if (!empty($state['domino_macro']) && $state['status_domino'] === 'PENDING') {
    $reply = "📥 *Capturado na Caixa de Ruído (Google Tasks) para depois do almoço.*\nVolte para o seu Dominó: *{$state['domino_macro']}*.";
} else {
    $reply = "📥 *Capturado no Google Tasks ({$domain_label})!*\n📌 *{$task_title}*\n_(Lembre-se: tarefas avulsas são secundárias. Qual é o seu Dominó principal de hoje?)_";
}

telegram_send($chat_id, $reply);
echo json_encode(['status' => 'ok', 'action' => 'create_task']);
