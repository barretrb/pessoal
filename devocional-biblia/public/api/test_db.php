<?php
header('Content-Type: application/json');
$hasPdo = class_exists('PDO');
$drivers = $hasPdo ? PDO::getAvailableDrivers() : [];
$hasSqlite = in_array('sqlite', $drivers);

echo json_encode([
    'php_version' => PHP_VERSION,
    'has_pdo' => $hasPdo,
    'pdo_drivers' => $drivers,
    'has_sqlite' => $hasSqlite
]);
