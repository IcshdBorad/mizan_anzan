<?php

/**
 * ميزان أنزان
 * فحص اتصال وبنية قاعدة البيانات
 *
 * المسار:
 * /public_html/mizan_anzan/tests/db_structure_check.php
 */

declare(strict_types=1);

header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/../includes/db.php';

echo '<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>فحص قاعدة بيانات أنزان</title>
<style>
body{
    font-family:Arial,Tahoma,sans-serif;
    background:#f5f7fb;
    color:#1e293b;
    padding:30px;
}
.box{
    max-width:900px;
    margin:auto;
    background:#fff;
    padding:30px;
    border-radius:16px;
    box-shadow:0 10px 30px rgba(0,0,0,.08);
}
.ok{
    color:#047857;
    background:#ecfdf5;
    border:1px solid #a7f3d0;
    padding:14px;
    border-radius:10px;
}
.error{
    color:#b91c1c;
    background:#fef2f2;
    border:1px solid #fecaca;
    padding:14px;
    border-radius:10px;
}
.info{
    background:#eff6ff;
    border:1px solid #bfdbfe;
    padding:14px;
    border-radius:10px;
}
table{
    width:100%;
    border-collapse:collapse;
    margin-top:20px;
}
th,td{
    padding:10px;
    border-bottom:1px solid #e5e7eb;
    text-align:right;
}
th{
    background:#f8fafc;
}
code{
    direction:ltr;
    display:inline-block;
}
</style>
</head>
<body>
<div class="box">
<h1>🔎 فحص قاعدة بيانات ميزان أنزان</h1>';

try {

    echo '<div class="ok">
        ✅ اتصال قاعدة البيانات ناجح.
    </div>';

    /*
    |--------------------------------------------------------------------------
    | معلومات قاعدة البيانات
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->query("SELECT DATABASE() AS db_name");
    $dbInfo = $stmt->fetch();

    echo '<div class="info" style="margin-top:15px;">
        قاعدة البيانات الحالية:
        <strong>' .
        htmlspecialchars(
            (string)$dbInfo['db_name'],
            ENT_QUOTES,
            'UTF-8'
        ) .
        '</strong>
    </div>';

    /*
    |--------------------------------------------------------------------------
    | الجداول المطلوبة
    |--------------------------------------------------------------------------
    */

    $tables = [
        'anzan_profiles',
        'anzan_sessions',
        'anzan_attempts',
        'anzan_results',
        'challenge_results',
    ];

    echo '<h2>الجداول</h2>';

    echo '<table>';
    echo '<tr><th>الجدول</th><th>الحالة</th><th>عدد السجلات</th></tr>';

    foreach ($tables as $table) {

        $stmt = $pdo->prepare("
            SELECT COUNT(*) 
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
              AND table_name = ?
        ");

        $stmt->execute([$table]);

        $exists = ((int)$stmt->fetchColumn() > 0);

        if ($exists) {

            $countStmt = $pdo->query(
                "SELECT COUNT(*) FROM `{$table}`"
            );

            $count = (int)$countStmt->fetchColumn();

            echo '<tr>';
            echo '<td><code>' .
                htmlspecialchars(
                    $table,
                    ENT_QUOTES,
                    'UTF-8'
                ) .
                '</code></td>';

            echo '<td style="color:#047857;font-weight:bold;">✓ موجود</td>';
            echo '<td>' . $count . '</td>';
            echo '</tr>';

        } else {

            echo '<tr>';
            echo '<td><code>' .
                htmlspecialchars(
                    $table,
                    ENT_QUOTES,
                    'UTF-8'
                ) .
                '</code></td>';

            echo '<td style="color:#b91c1c;font-weight:bold;">✕ غير موجود</td>';
            echo '<td>—</td>';
            echo '</tr>';
        }
    }

    echo '</table>';

    /*
    |--------------------------------------------------------------------------
    | أعمدة الجداول المهمة
    |--------------------------------------------------------------------------
    */

    $inspectTables = [
        'anzan_results',
        'anzan_sessions',
        'anzan_attempts',
    ];

    foreach ($inspectTables as $table) {

        $stmt = $pdo->prepare("
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
              AND table_name = ?
        ");

        $stmt->execute([$table]);

        if ((int)$stmt->fetchColumn() === 0) {
            continue;
        }

        echo '<h2>أعمدة: <code>' .
            htmlspecialchars(
                $table,
                ENT_QUOTES,
                'UTF-8'
            ) .
            '</code></h2>';

        $stmt = $pdo->prepare("
            SELECT
                COLUMN_NAME,
                COLUMN_TYPE,
                IS_NULLABLE,
                COLUMN_DEFAULT
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = ?
            ORDER BY ORDINAL_POSITION
        ");

        $stmt->execute([$table]);

        echo '<table>';
        echo '<tr>
                <th>العمود</th>
                <th>النوع</th>
                <th>NULL</th>
                <th>القيمة الافتراضية</th>
              </tr>';

        while ($column = $stmt->fetch()) {

            echo '<tr>';

            echo '<td><code>' .
                htmlspecialchars(
                    (string)$column['COLUMN_NAME'],
                    ENT_QUOTES,
                    'UTF-8'
                ) .
                '</code></td>';

            echo '<td>' .
                htmlspecialchars(
                    (string)$column['COLUMN_TYPE'],
                    ENT_QUOTES,
                    'UTF-8'
                ) .
                '</td>';

            echo '<td>' .
                htmlspecialchars(
                    (string)$column['IS_NULLABLE'],
                    ENT_QUOTES,
                    'UTF-8'
                ) .
                '</td>';

            echo '<td>' .
                htmlspecialchars(
                    (string)($column['COLUMN_DEFAULT'] ?? 'NULL'),
                    ENT_QUOTES,
                    'UTF-8'
                ) .
                '</td>';

            echo '</tr>';
        }

        echo '</table>';
    }

} catch (Throwable $e) {

    http_response_code(500);

    echo '<div class="error">
        <strong>❌ حدث خطأ</strong><br><br>';

    echo htmlspecialchars(
        $e->getMessage(),
        ENT_QUOTES,
        'UTF-8'
    );

    echo '</div>';
}

echo '
</div>
</body>
</html>';