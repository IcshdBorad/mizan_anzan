<?php
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

/* Diagnostic only. It uses the same central connection as production. */

echo "MIZAN ANZAN - DATABASE DIAGNOSTIC\n";
echo "=================================\n\n";
echo "PHP: " . PHP_VERSION . "\n\n";

try {
    require_once __DIR__ . '/includes/db.php';
    echo "DB CONNECTION: SUCCESS\n";
    echo "Database: " . (string)$pdo->query('SELECT DATABASE()')->fetchColumn() . "\n";
    echo "MySQL: " . (string)$pdo->query('SELECT VERSION()')->fetchColumn() . "\n\n";

    foreach (['anzan_profiles', 'anzan_results', 'mizan_accounts', 'mizan_entities', 'mizan_branches', 'mizan_relationships'] as $table) {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=:t');
        $stmt->execute([':t' => $table]);
        echo $table . ': ' . ((int)$stmt->fetchColumn() ? 'EXISTS' : 'MISSING') . "\n";
    }

    echo "\nRESULT: DATABASE CONNECTION OK\n";
} catch (Throwable $e) {
    error_log('[MIZAN test_db] ' . $e->getMessage());
    echo "DB CONNECTION: FAILED\n";
    echo "RESULT: CHECK includes/db-config.php AND hPanel MYSQL CREDENTIALS\n";
}
