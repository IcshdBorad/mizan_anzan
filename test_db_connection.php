<?php

/**
 * ميزان أنزان
 * اختبار اتصال قاعدة البيانات
 *
 * المسار:
 * /public_html/mizan_anzan/tests/test_db_connection.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: text/html; charset=utf-8');

try {

    /*
    |--------------------------------------------------------------------------
    | اختبار الاتصال
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->query("SELECT 1 AS connection_test");

    $result = $stmt->fetch();

    /*
    |--------------------------------------------------------------------------
    | فحص الجداول الأساسية
    |--------------------------------------------------------------------------
    */

    $requiredTables = [
        'anzan_profiles',
        'anzan_sessions',
        'anzan_attempts',
    ];

    $tableStatus = [];

    foreach ($requiredTables as $table) {

        $stmt = $pdo->prepare("
            SELECT COUNT(*) AS table_exists
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
              AND table_name = ?
        ");

        $stmt->execute([$table]);

        $exists = (int)$stmt->fetchColumn() > 0;

        $tableStatus[$table] = $exists;
    }

} catch (Throwable $e) {

    http_response_code(500);

    echo '<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>اختبار قاعدة بيانات أنزان</title>
</head>
<body>
    <h2>فشل الاختبار</h2>
    <p>حدث خطأ أثناء اختبار قاعدة البيانات.</p>
</body>
</html>';

    error_log(
        'Mizan Anzan DB Test Error: ' . $e->getMessage()
    );

    exit;
}

$allTablesExist = !in_array(false, $tableStatus, true);

?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>اختبار قاعدة بيانات ميزان أنزان</title>

    <style>

        body {
            margin: 0;
            padding: 40px 20px;
            background: #f5f7fb;
            color: #1e293b;
            font-family:
                "Segoe UI",
                Tahoma,
                Arial,
                sans-serif;
        }

        .container {
            max-width: 720px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 18px;
            padding: 30px;
            box-shadow:
                0 10px 35px rgba(15, 23, 42, 0.08);
        }

        h1 {
            margin-top: 0;
        }

        .status {
            padding: 15px 18px;
            border-radius: 12px;
            margin: 20px 0;
            font-weight: 700;
        }

        .success {
            background: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
        }

        .warning {
            background: #fffbeb;
            color: #b45309;
            border: 1px solid #fde68a;
        }

        .table-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 14px 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .ok {
            color: #047857;
            font-weight: 700;
        }

        .missing {
            color: #dc2626;
            font-weight: 700;
        }

        code {
            direction: ltr;
            display: inline-block;
            background: #f1f5f9;
            padding: 3px 7px;
            border-radius: 5px;
        }

    </style>

</head>

<body>

<div class="container">

    <h1>🔎 اختبار ميزان أنزان</h1>

    <?php if ($result && (int)$result['connection_test'] === 1): ?>

        <div class="status success">
            ✅ اتصال قاعدة البيانات يعمل بنجاح.
        </div>

    <?php else: ?>

        <div class="status warning">
            ⚠️ الاتصال غير مكتمل.
        </div>

    <?php endif; ?>


    <h2>الجداول الأساسية</h2>

    <?php foreach ($tableStatus as $table => $exists): ?>

        <div class="table-row">

            <span>
                <code><?= htmlspecialchars($table, ENT_QUOTES, 'UTF-8') ?></code>
            </span>

            <?php if ($exists): ?>

                <span class="ok">
                    ✓ موجود
                </span>

            <?php else: ?>

                <span class="missing">
                    ✕ غير موجود
                </span>

            <?php endif; ?>

        </div>

    <?php endforeach; ?>


    <?php if ($allTablesExist): ?>

        <div class="status success">
            ✅ البنية الأساسية لقاعدة بيانات أنزان جاهزة.
        </div>

    <?php else: ?>

        <div class="status warning">
            ⚠️ بعض الجداول الأساسية غير موجودة.
        </div>

    <?php endif; ?>

</div>

</body>
</html>