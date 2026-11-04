<?php
// Executor de Rituais Agendados (Cron Jobs) - Hostinger
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/services.php';

$action = $_GET['action'] ?? 'morning';
$now = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
$state_file = __DIR__ . '/state.json';
$state = file_exists($state_file) ? json_decode(file_get_contents($state_file), true) : [];

function save_cron_state($state) {
    global $state_file;
    file_put_contents($state_file, json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$chat_id = $state['last_chat_id'] ?? '5521968746262'; // chat_id ou fallback
$token = get_google_access_token();

switch ($action) {
    case 'morning':
        $pro_tasks = $token ? google_tasks_list($token, 'professional') : [];
        $events = $token ? google_calendar_list_events($token, $now) : [];
        
        $msg = "☀️ *Bom dia, Rafael! Ritual Matinal 'A Única Coisa' (" . $now->format('d/m') . ")*\n\n";
        if (!empty($pro_tasks)) {
            $msg .= "🎯 *Sugestão de Dominó para Hoje:*\n📌 *" . $pro_tasks[0]['title'] . "*\n\n";
        }
        $msg .= "Responda *\"OK\"* para bloquear a agenda ou defina: *\"Meu dominó de hoje é X\"*.\nTenha um dia de foco extremo!";
        
        if (!empty($state['last_chat_id'])) {
            telegram_send($state['last_chat_id'], $msg);
        }
        echo json_encode(['status' => 'morning_sent', 'tasks_found' => count($pro_tasks)]);
        break;

    case 'lunch':
        $pills = [
            "🎯 *Pílula d'A Única Coisa:* 'Se você persegue dois coelhos, não alcançará nenhum.' Foque no seu bloco de hoje.",
            "⏳ *Pílula d'A Única Coisa:* 'O tempo é a única coisa que não se recupera. Bloqueie sua agenda como uma fortaleza.'",
            "⚖️ *Pílula d'A Única Coisa:* 'Equilíbrio é um mito. A vida é um contrapeso constante entre trabalho e vida pessoal.'",
            "🧱 *Pílula d'A Única Coisa:* 'O efeito dominó começa pequeno, mas cada peça derruba uma 50% maior. Qual dominó você derruba hoje?'"
        ];
        $pill = $pills[array_rand($pills)];
        if (!empty($state['last_chat_id'])) {
            telegram_send($state['last_chat_id'], $pill);
        }
        echo json_encode(['status' => 'lunch_pill_sent']);
        break;

    case 'night':
        $msg = "🌙 *Check-in Noturno 'A Única Coisa' (" . $now->format('d/m') . ")*\n\n"
            . "Você conseguiu derrubar o seu Dominó de hoje?\n"
            . "Responda: *'Concluí o dominó'* ou me conte como foi o seu foco!";
        if (!empty($state['last_chat_id'])) {
            telegram_send($state['last_chat_id'], $msg);
        }
        echo json_encode(['status' => 'night_checkin_sent']);
        break;

    case 'weekly':
        $msg = "📅 *Planejamento Semanal 'A Única Coisa'*\n\n"
            . "Uma nova semana começa! Qual é o seu grande objetivo e dominó desta semana?";
        if (!empty($state['last_chat_id'])) {
            telegram_send($state['last_chat_id'], $msg);
        }
        echo json_encode(['status' => 'weekly_sent']);
        break;

    default:
        echo json_encode(['status' => 'unknown_action']);
}
