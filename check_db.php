<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| MIZAN ANZAN
| Database Connection Diagnostic
|--------------------------------------------------------------------------
|
| المسار:
| /public_html/mizan_anzan/check_db.php
|
| هذا الملف تشخيص مؤقت فقط.
| لا يعرض كلمة مرور قاعدة البيانات.
|--------------------------------------------------------------------------
*/

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');

error_reporting(E_ALL);

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

echo "MIZAN ANZAN - DATABASE DIAGNOSTIC\n";
echo "=================================\n\n";

echo "[1] PHP VERSION\n";
echo "PHP: " . PHP_VERSION . "\n\n";

echo "[2] LOADING db.php\n";

try {

    require_once __DIR__ . '/includes/db.php';

    echo "db.php loaded: YES\n";

} catch (Throwable $e) {

    echo "db.php loaded: NO\n\n";

    echo "EXCEPTION CLASS:\n";
    echo get_class($e) . "\n\n";

    echo "ERROR MESSAGE:\n";
    echo $e->getMessage() . "\n\n";

    echo "ERROR CODE:\n";
    echo (string)$e->getCode() . "\n\n";

    echo "[RESULT]\n";
    echo "DATABASE CONNECTION FAILED\n";

    exit;
}

echo "\n[3] PDO OBJECT\n";

if (!isset($pdo) || !($pdo instanceof PDO)) {

    echo "PDO object: NO\n";
    echo "\n[RESULT]\n";
    echo "PDO OBJECT WAS NOT CREATED\n";

    exit;
}

echo "PDO object: YES\n\n";

echo "[4] CONNECTION TEST\n";

try {

    $stmt = $pdo->query(
        "SELECT
            DATABASE() AS db_name,
            USER() AS mysql_user,
            CURRENT_USER() AS authenticated_user,
            VERSION() AS mysql_version"
    );

    $info = $stmt->fetch(PDO::FETCH_ASSOC);

    echo "CONNECTION: SUCCESS\n\n";

    echo "Database:\n";
    echo (string)($info['db_name'] ?? '') . "\n\n";

    echo "USER():\n";
    echo (string)($info['mysql_user'] ?? '') . "\n\n";

    echo "CURRENT_USER():\n";
    echo (string)($info['authenticated_user'] ?? '') . "\n\n";

    echo "MySQL version:\n";
    echo (string)($info['mysql_version'] ?? '') . "\n\n";

} catch (Throwable $e) {

    echo "CONNECTION: FAILED\n\n";

    echo "EXCEPTION CLASS:\n";
    echo get_class($e) . "\n\n";

    echo "ERROR MESSAGE:\n";
    echo $e->getMessage() . "\n\n";

    echo "ERROR CODE:\n";
    echo (string)$e->getCode() . "\n\n";

    echo "[RESULT]\n";
    echo "MYSQL AUTHENTICATION FAILED\n";

    exit;
}

echo "[5] DATABASE TABLE TEST\n";

try {

    $stmt = $pdo->query(
        "SHOW TABLES"
    );

    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "TABLE QUERY: SUCCESS\n";
    echo "TABLE COUNT: " . count($tables) . "\n\n";

    if ($tables) {

        echo "TABLES:\n";

        foreach ($tables as $table) {
            echo "- " . $table . "\n";
        }

        echo "\n";
    }

} catch (Throwable $e) {

    echo "TABLE QUERY: FAILED\n\n";

    echo "ERROR:\n";
    echo $e->getMessage() . "\n\n";

    echo "[RESULT]\n";
    echo "CONNECTED BUT TABLE ACCESS FAILED\n";

    exit;
}

echo "[6] ANZAN TABLE TEST\n";

try {

    $stmt = $pdo->query(
        "SHOW TABLES LIKE 'anzan_profiles'"
    );

    $anzanProfilesExists = $stmt->fetchColumn();

    echo "anzan_profiles: ";

    if ($anzanProfilesExists !== false) {
        echo "EXISTS\n";
    } else {
        echo "NOT FOUND\n";
    }

} catch (Throwable $e) {

    echo "anzan_profiles test failed\n";
    echo $e->getMessage() . "\n";

    exit;
}

echo "\n[7] RESULTS TABLE TEST\n";

try {

    $stmt = $pdo->query(
        "SHOW TABLES LIKE 'anzan_results'"
    );

    $anzanResultsExists = $stmt->fetchColumn();

    echo "anzan_results: ";

    if ($anzanResultsExists !== false) {
        echo "EXISTS\n";
    } else {
        echo "NOT FOUND\n";
    }

} catch (Throwable $e) {

    echo "anzan_results test failed\n";
    echo $e->getMessage() . "\n";

    exit;
}

echo "\n=================================\n";
echo "DATABASE DIAGNOSTIC COMPLETE\n";
echo "=================================\n";