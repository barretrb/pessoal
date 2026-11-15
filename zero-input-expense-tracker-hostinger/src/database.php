<?php
declare(strict_types=1);

function get_db(array $config): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dbPath = $config['db_path'];
    $dir = dirname($dbPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $htaccessPath = $dir . '/.htaccess';
    if (!file_exists($htaccessPath)) {
        file_put_contents($htaccessPath, "Deny from all\n");
    }

    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA foreign_keys = ON;');
    $pdo->exec('PRAGMA journal_mode = WAL;');

    init_schema($pdo);
    return $pdo;
}

function init_schema(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS annual_plan (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL,
            plan_type TEXT NOT NULL DEFAULT 'FIXED',
            payment_method TEXT NOT NULL DEFAULT 'PIX',
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            day_of_month INTEGER NOT NULL,
            start_month INTEGER NOT NULL DEFAULT 1,
            end_month INTEGER NOT NULL DEFAULT 12,
            active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL DEFAULT 'NOTIFICATION',
            app_name TEXT,
            raw_title TEXT,
            raw_text TEXT,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            merchant TEXT NOT NULL,
            merchant_normalized TEXT NOT NULL,
            installments INTEGER NOT NULL DEFAULT 1,
            category TEXT NOT NULL,
            confidence REAL NOT NULL DEFAULT 1.0,
            status TEXT NOT NULL DEFAULT 'CONFIRMED',
            occurred_at TEXT NOT NULL,
            telegram_message_id INTEGER,
            annual_plan_id INTEGER REFERENCES annual_plan(id) ON DELETE SET NULL,
            plan_period TEXT,
            created_at TEXT NOT NULL,
            UNIQUE(annual_plan_id, plan_period)
        );

        CREATE INDEX IF NOT EXISTS idx_tx_occurred ON transactions(occurred_at);
        CREATE INDEX IF NOT EXISTS idx_tx_amount ON transactions(amount);
        CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(status);

        CREATE TABLE IF NOT EXISTS merchant_memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            merchant_normalized TEXT NOT NULL UNIQUE,
            merchant_display TEXT NOT NULL,
            category TEXT NOT NULL,
            hit_count INTEGER NOT NULL DEFAULT 1,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS login_attempts (
            ip TEXT PRIMARY KEY,
            attempts INTEGER NOT NULL DEFAULT 0,
            locked_until INTEGER NOT NULL DEFAULT 0,
            updated_at INTEGER NOT NULL DEFAULT 0
        );
    ");

    $cols = [];
    foreach ($pdo->query('PRAGMA table_info(annual_plan)')->fetchAll() as $col) {
        $cols[$col['name']] = true;
    }
    if (!isset($cols['plan_type'])) {
        $pdo->exec("ALTER TABLE annual_plan ADD COLUMN plan_type TEXT NOT NULL DEFAULT 'FIXED'");
    }
    if (!isset($cols['payment_method'])) {
        $pdo->exec("ALTER TABLE annual_plan ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'PIX'");
    }
}
