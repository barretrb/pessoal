<?php
// Executor de Rituais Agendados (Cron Jobs) - Hostinger
// Filosofia: Engenharia de Execução Neuro-Estratégica (WOOP, Ritmos Ultradianos, Zeigarnik, Implementação)
date_default_timezone_set('America/Sao_Paulo');
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/services.php';

$action = $_GET['action'] ?? 'morning';
$now = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
$state = get_agent_state();

$chat_id = $state['chat_id'] ?? '5521968746262';
$token = get_google_access_token();

switch ($action) {
    case 'morning':
        $pro_tasks = $token ? google_tasks_list($token, 'professional') : [];
        $pes_tasks = $token ? google_tasks_list($token, 'personal') : [];
        $events = $token ? google_calendar_list_events($token, $now) : [];

        $seed = !empty($state['tomorrow_seed']) ? trim($state['tomorrow_seed']) : null;

        $msg = "☀️ *Ritual Neuro-Estratégico — 08h00 (" . $now->format('d/m') . ")*\n\n";

        if ($seed) {
            $msg .= "🌱 *Alvo planejado na véspera (Efeito Zeigarnik):*\n📌 *{$seed}*\n\n";
        } elseif (!empty($pro_tasks)) {
            $msg .= "📋 *Sugestão do topo da lista:* *" . $pro_tasks[0]['title'] . "*\n\n";
        }

        $event_count = count($events);
        $task_count = count($pro_tasks);
        $msg .= "📊 *Radar do dia:* {$event_count} compromisso(s) na agenda | {$task_count} tarefa(s) ativas.\n\n"
            . "1. 🎯 *Qual é a ÚNICA entrega de hoje*" . ($seed ? " (confirma a de ontem)?" : "?") . "\n"
            . "2. 🧠 *O que mais dá preguiça/trava no início dela e qual horário vamos bloquear?*\n\n"
            . "_(Exemplo de resposta: 'Deck de AI em PS, começo às 09h30')_";

        $state['conversation_step'] = 'AWAITING_DOMINO';
        save_agent_state($state);

        if (!empty($chat_id)) {
            telegram_send($chat_id, $msg);
        }
        echo json_encode(['status' => 'morning_neuro_sent', 'seed_used' => !empty($seed)]);
        break;

    case 'lunch':
        $domino = !empty($state['domino_macro']) ? $state['domino_macro'] : null;
        $micro = !empty($state['micro_acao_5min']) ? $state['micro_acao_5min'] : 'ação de 5 minutos';
        $status = $state['status_domino'] ?? 'PENDING';

        $msg = "🥪 *Ponto de Controle Neuro-Estratégico (12h30)*\n\n";

        if ($domino) {
            if ($status === 'COMPLETED') {
                $msg .= "🏆 *Parabéns!* Seu Dominó (*{$domino}*) já foi concluído pela manhã.\n\n"
                    . "O resto do dia é para *Shallow Work* (lote de tarefas secundárias da lista) ou descanso.";
            } elseif ($status === 'MICRO_DONE') {
                $msg .= "🔥 *A inércia já foi rompida:* você já executou a micro-ação inicial do Dominó (*{$domino}*).\n\n"
                    . "Mantenha o foco puro no bloco da tarde para finalizar o entregável.";
            } else {
                $msg .= "Você conseguiu executar pelo menos a Ação de 5 minutos (*{$micro}*) do seu Dominó (*{$domino}*) hoje?\n\n"
                    . "⚡ Se travou: me diga onde empacou para reduzirmos o escopo pela metade para o bloco vespertino.";
            }
        } else {
            $msg .= "Ainda não ativamos o seu Dominó de hoje.\n"
                . "Qual é a micro-ação de 5 minutos em texto puro que você pode rodar agora para destravar a tarde?";
        }

        if (!empty($chat_id)) {
            telegram_send($chat_id, $msg);
        }
        echo json_encode(['status' => 'lunch_neuro_sent', 'has_domino' => !empty($domino)]);
        break;

    case 'night':
        $domino = !empty($state['domino_macro']) ? $state['domino_macro'] : 'seu foco principal';

        $msg = "🌙 *Fechamento do Dia & Descompressão Cognitiva (18h30)*\n\n"
            . "O dominó *{$domino}* caiu, avançou ou travou?\n"
            . "_(Sem culpa nem cobrança moral se travou: apenas diagnóstico de atrito cognitivo)._\n\n"
            . "🧠 *Para liberar sua memória de trabalho (RAM) hoje:* em 1 linha, qual será o seu alvo principal de amanhã?";

        $state['conversation_step'] = 'AWAITING_TOMORROW_SEED';
        save_agent_state($state);

        if (!empty($chat_id)) {
            telegram_send($chat_id, $msg);
        }
        echo json_encode(['status' => 'night_neuro_sent']);
        break;

    case 'weekly':
        $msg = "📅 *Planejamento Semanal Neuro-Estratégico*\n\n"
            . "Qual é a grande alavanca que vai destravar a sua semana?\n"
            . "Pense no primeiro dominó de maior impacto. Qual é a entrega principal de amanhã?";

        $state['conversation_step'] = 'AWAITING_TOMORROW_SEED';
        save_agent_state($state);

        if (!empty($chat_id)) {
            telegram_send($chat_id, $msg);
        }
        echo json_encode(['status' => 'weekly_neuro_sent']);
        break;

    default:
        echo json_encode(['status' => 'unknown_action']);
}
