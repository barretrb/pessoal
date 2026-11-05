<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Origin, Accept');
header('Cache-Control: no-cache, no-store, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Armazenamento 100% persistente for a da pasta de deploy estático
$persistentDir = dirname(__DIR__, 3) . '/devocional_storage';
if (!is_dir($persistentDir)) {
    @mkdir($persistentDir, 0755, true);
}

$dataFile = $persistentDir . '/vault.json';
$sqliteFile = $persistentDir . '/devocional.sqlite';

function getBaselineData() {
    $progress = [];
    for ($i = 1; $i <= 308; $i++) {
        $progress[(string)$i] = ['completed' => true, 'completedAt' => '2026-11-04T23:59:59.000Z'];
    }
    return [
        'version' => 4,
        'familyCode' => 'DEVOCIONAL-SYNC-RAFAEL',
        'lastCompletedDay' => 308,
        'pendingDays' => [],
        'completedChapters' => [
            'Lucas 1', 'Lucas 2', 'Lucas 3', 'Lucas 4', 'Lucas 5', 'Lucas 6', 'Lucas 7', 'Lucas 8', 'Lucas 9',
            'Lucas 10', 'Lucas 11', 'Lucas 12', 'Lucas 13', 'Lucas 14', 'Lucas 15', 'Lucas 16', 'Lucas 17', 'Lucas 18',
            'Lucas 19', 'Lucas 20', 'Lucas 21', 'Lucas 22', 'Lucas 23', 'Lucas 24',
            'João 1', 'João 2', 'João 3', 'João 4', 'João 5', 'João 6', 'João 7', 'João 8', 'João 9',
            'João 10', 'João 11', 'João 12', 'João 13', 'João 14', 'João 15', 'João 16', 'João 17', 'João 18',
            'João 19', 'João 20', 'João 21'
        ],
        'updatedAt' => date('c'),
        'profiles' => [
            [
                'id' => 'default',
                'name' => 'Rafael',
                'avatar' => '👨',
                'role' => 'admin',
                'pin' => '1234',
                'requiresPin' => true,
                'planOptIn' => true,
                'startDayId' => 1
            ]
        ],
        'activeProfileId' => 'default',
        'progressByProfile' => [
            'default' => $progress
        ],
        'favoritesByProfile' => ['default' => []],
        'highlightsByProfile' => ['default' => new stdClass()]
    ];
}

// Inicializar SQLite para redundância transacional
function initSqlite($sqliteFile) {
    try {
        $pdo = new PDO('sqlite:' . $sqliteFile);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec("CREATE TABLE IF NOT EXISTS cloud_vault (id TEXT PRIMARY KEY, payload TEXT, updated_at TEXT)");
        return $pdo;
    } catch (Exception $e) {
        return null;
    }
}

function loadStoredData($dataFile, $sqliteFile) {
    if (file_exists($dataFile)) {
        $content = @file_get_contents($dataFile);
        if ($content) {
            $json = json_decode($content, true);
            if ($json && isset($json['data'])) return $json['data'];
            if ($json) return $json;
        }
    }

    $pdo = initSqlite($sqliteFile);
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT payload FROM cloud_vault WHERE id = 'sync_rafael'");
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row && !empty($row['payload'])) {
                $decoded = json_decode($row['payload'], true);
                if ($decoded) return $decoded;
            }
        } catch (Exception $e) {}
    }

    return getBaselineData();
}

function saveStoredData($data, $dataFile, $sqliteFile) {
    $wrapped = ['status' => 'success', 'data' => $data];
    $json = json_encode($wrapped, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    // Escrita atômica em arquivo para evitar corrupção em concorrência
    $tmp = $dataFile . '.tmp.' . uniqid();
    @file_put_contents($tmp, $json);
    @rename($tmp, $dataFile);

    // Salvar redundância no SQLite
    $pdo = initSqlite($sqliteFile);
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT OR REPLACE INTO cloud_vault (id, payload, updated_at) VALUES ('sync_rafael', :payload, :updated_at)");
            $stmt->execute([
                ':payload' => json_encode($data, JSON_UNESCAPED_UNICODE),
                ':updated_at' => $data['updatedAt'] ?? date('c')
            ]);
        } catch (Exception $e) {}
    }
}

// Processar POST (Salvar / Sincronizar)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    if ($input) {
        $incoming = json_decode($input, true);
        if ($incoming) {
            $payload = isset($incoming['data']) ? $incoming['data'] : $incoming;
            $current = loadStoredData($dataFile, $sqliteFile);

            // Mesclagem Inteligente Não-Destrutiva
            $currentLastDay = (int)($current['lastCompletedDay'] ?? 308);
            $incomingLastDay = (int)($payload['lastCompletedDay'] ?? 0);
            $newLastDay = max($currentLastDay, $incomingLastDay, 308);

            // União de capítulos lidos
            $chaptersSet = [];
            foreach (($current['completedChapters'] ?? []) as $ch) { $chaptersSet[$ch] = true; }
            foreach (($payload['completedChapters'] ?? []) as $ch) { $chaptersSet[$ch] = true; }
            $mergedChapters = array_keys($chaptersSet);

            // Mesclagem de progresso por perfil
            $mergedProgress = $current['progressByProfile'] ?? ['default' => []];
            if (isset($payload['progressByProfile']) && is_array($payload['progressByProfile'])) {
                foreach ($payload['progressByProfile'] as $pId => $days) {
                    if (!isset($mergedProgress[$pId])) $mergedProgress[$pId] = [];
                    foreach ($days as $dId => $dData) {
                        $isCompleted = !empty($dData['completed']);
                        // Se completado em qualquer aparelho, prevalece como completado
                        $mergedProgress[$pId][$dId] = [
                            'completed' => $isCompleted || (!empty($mergedProgress[$pId][$dId]['completed'])),
                            'completedAt' => $dData['completedAt'] ?? ($mergedProgress[$pId][$dId]['completedAt'] ?? date('c'))
                        ];
                    }
                }
            }

            // Assegurar baseline até newLastDay para o Rafael
            for ($d = 1; $d <= $newLastDay; $d++) {
                $dKey = (string)$d;
                if (!isset($mergedProgress['default'][$dKey]) || empty($mergedProgress['default'][$dKey]['completed'])) {
                    $mergedProgress['default'][$dKey] = [
                        'completed' => true,
                        'completedAt' => '2026-11-04T23:59:59.000Z'
                    ];
                }
            }

            // Se o payload indicar pendências explícitas (ex: desmarcado intencionalmente)
            if (isset($payload['pendingDays']) && is_array($payload['pendingDays'])) {
                foreach ($payload['pendingDays'] as $pendingDay) {
                    $mergedProgress['default'][(string)$pendingDay] = [
                        'completed' => false,
                        'completedAt' => null
                    ];
                }
            }

            // Mesclagem de perfis
            $profilesMap = [];
            foreach (($current['profiles'] ?? []) as $p) { $profilesMap[$p['id']] = $p; }
            foreach (($payload['profiles'] ?? []) as $p) {
                if (isset($profilesMap[$p['id']])) {
                    $profilesMap[$p['id']] = array_merge($profilesMap[$p['id']], $p);
                } else {
                    $profilesMap[$p['id']] = $p;
                }
            }

            // Mesclagem de favoritos
            $mergedFavorites = $current['favoritesByProfile'] ?? ['default' => []];
            if (isset($payload['favoritesByProfile']) && is_array($payload['favoritesByProfile'])) {
                foreach ($payload['favoritesByProfile'] as $pId => $favs) {
                    $existingKeys = [];
                    $curFavs = $mergedFavorites[$pId] ?? [];
                    foreach ($curFavs as $f) { if (isset($f['key'])) $existingKeys[$f['key']] = true; }
                    foreach ($favs as $f) {
                        if (isset($f['key']) && !isset($existingKeys[$f['key']])) {
                            $curFavs[] = $f;
                            $existingKeys[$f['key']] = true;
                        }
                    }
                    $mergedFavorites[$pId] = $curFavs;
                }
            }

            // Mesclagem de destaques (highlights)
            $mergedHighlights = $current['highlightsByProfile'] ?? ['default' => []];
            if (isset($payload['highlightsByProfile']) && is_array($payload['highlightsByProfile'])) {
                foreach ($payload['highlightsByProfile'] as $pId => $highs) {
                    $curHighs = (array)($mergedHighlights[$pId] ?? []);
                    $mergedHighlights[$pId] = array_merge($curHighs, (array)$highs);
                }
            }

            $mergedData = [
                'version' => 4,
                'familyCode' => $payload['familyCode'] ?? ($current['familyCode'] ?? 'DEVOCIONAL-SYNC-RAFAEL'),
                'lastCompletedDay' => $newLastDay,
                'pendingDays' => $payload['pendingDays'] ?? [],
                'completedChapters' => $mergedChapters,
                'updatedAt' => date('c'),
                'profiles' => array_values($profilesMap),
                'activeProfileId' => $payload['activeProfileId'] ?? ($current['activeProfileId'] ?? 'default'),
                'progressByProfile' => $mergedProgress,
                'favoritesByProfile' => $mergedFavorites,
                'highlightsByProfile' => $mergedHighlights
            ];

            saveStoredData($mergedData, $dataFile, $sqliteFile);

            echo json_encode(['status' => 'success', 'updatedAt' => $mergedData['updatedAt'], 'data' => $mergedData], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit;
}

// Processar GET (Carregar estado atualizado)
$current = loadStoredData($dataFile, $sqliteFile);
echo json_encode(['status' => 'success', 'data' => $current], JSON_UNESCAPED_UNICODE);
