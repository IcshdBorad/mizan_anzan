<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| ميزان أنزان
| سجل تدريب الطالب والتقارير
|--------------------------------------------------------------------------
| المسار:
| /public_html/mizan_anzan/student_history.php
|--------------------------------------------------------------------------
| كل نتيجة مرتبطة بهوية الطالب عبر student_id و student_code.
| التقرير التفصيلي يُفتح من generate_report.php?id=...
|--------------------------------------------------------------------------
*/

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

require_once __DIR__ . '/includes/db.php';

function e(mixed $value): string
{
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function fmtDate(mixed $value): string
{
    if (!$value) {
        return '—';
    }

    $time = strtotime((string)$value);
    return $time === false ? e($value) : date('Y-m-d H:i', $time);
}

function fmtNumber(mixed $value, int $decimals = 2): string
{
    if ($value === null || $value === '') {
        return '—';
    }

    return number_format((float)$value, $decimals);
}

$studentId = isset($_SESSION['student_id']) && is_numeric($_SESSION['student_id'])
    ? (int)$_SESSION['student_id']
    : null;

$studentCode = trim((string)($_SESSION['student_code'] ?? ''));

if (($studentId === null || $studentId <= 0) && $studentCode === '') {
    http_response_code(401);
    $pageError = 'يجب تسجيل الطالب أولاً لعرض سجل التدريب والتقارير.';
    $rows = [];
} else {
    $rows = [];
    $pageError = '';

    try {
        if ($studentId !== null && $studentId > 0) {
            $stmt = $pdo->prepare(
                'SELECT
                    id,
                    student_code,
                    student_name,
                    country,
                    age_category,
                    training_mode,
                    level,
                    operation_type,
                    digits_count,
                    rows_count,
                    duration_seconds,
                    time_taken_seconds,
                    speed_ms,
                    total_questions,
                    correct_answers,
                    score,
                    accuracy_percentage,
                    created_at
                 FROM anzan_results
                 WHERE student_id = :student_id
                    OR student_code = :student_code
                 ORDER BY id DESC
                 LIMIT 100'
            );
            $stmt->execute([
                ':student_id' => $studentId,
                ':student_code' => $studentCode,
            ]);
        } else {
            $stmt = $pdo->prepare(
                'SELECT
                    id,
                    student_code,
                    student_name,
                    country,
                    age_category,
                    training_mode,
                    level,
                    operation_type,
                    digits_count,
                    rows_count,
                    duration_seconds,
                    time_taken_seconds,
                    speed_ms,
                    total_questions,
                    correct_answers,
                    score,
                    accuracy_percentage,
                    created_at
                 FROM anzan_results
                 WHERE student_code = :student_code
                 ORDER BY id DESC
                 LIMIT 100'
            );
            $stmt->execute([':student_code' => $studentCode]);
        }

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch (Throwable $e) {
        error_log('ANZAN student history error: ' . $e->getMessage());
        http_response_code(500);
        $pageError = 'تعذر قراءة سجل التدريب حالياً.';
    }
}

$studentName = trim((string)($_SESSION['student_name'] ?? 'طالب أنزان'));
$displayCode = $studentCode !== '' ? $studentCode : '—';
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#07111f">
    <title>سجل التدريب — ميزان أنزان</title>
    <style>
        :root {
            --bg:#07111f;
            --card:#0d172a;
            --card2:#111d31;
            --gold:#d4af37;
            --gold2:#f4d35e;
            --text:#f8fafc;
            --muted:#aeb8c7;
            --border:rgba(212,175,55,.25);
        }
        *{box-sizing:border-box}
        body{margin:0;min-height:100vh;background:linear-gradient(135deg,#050b14,#07111f 48%,#0a1424);color:var(--text);font-family:Tahoma,Arial,sans-serif}
        .wrap{width:min(1400px,calc(100% - 28px));margin:0 auto;padding:28px 0 50px}
        .header,.card{background:linear-gradient(145deg,rgba(13,23,42,.98),rgba(7,17,31,.96));border:1px solid var(--border);box-shadow:0 20px 60px rgba(0,0,0,.28)}
        .header{border-radius:18px;padding:22px 24px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:18px}
        h1{margin:0 0 7px;color:var(--gold2);font-size:clamp(20px,3vw,30px)}
        .meta{color:var(--muted);line-height:1.8;font-size:13px}
        .code{font-family:monospace;color:var(--gold2);font-weight:900}
        .back{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 18px;border-radius:12px;border:1px solid rgba(212,175,55,.4);color:var(--gold2);text-decoration:none;font-weight:800}
        .card{border-radius:18px;overflow:hidden}
        .notice{padding:34px;text-align:center;color:var(--muted)}
        .table-wrap{overflow-x:auto}
        table{width:100%;border-collapse:collapse;min-width:1050px}
        th,td{padding:13px 12px;border-bottom:1px solid rgba(255,255,255,.07);white-space:nowrap;text-align:center}
        th{background:rgba(0,0,0,.25);color:var(--gold2);font-size:12px}
        td{font-size:12px;color:#e5e7eb}
        tr:hover td{background:rgba(212,175,55,.035)}
        .score{color:#86efac;font-weight:900}
        .accuracy{color:#67e8f9;font-weight:900}
        .report{display:inline-flex;min-height:36px;align-items:center;justify-content:center;padding:7px 12px;border-radius:9px;background:linear-gradient(135deg,#d4af37,#e58f00);color:#07111f;text-decoration:none;font-weight:900}
        @media(max-width:700px){.wrap{width:min(100% - 18px,1400px);padding-top:12px}.header{padding:17px;align-items:flex-start;flex-direction:column}.back{width:100%}}
    </style>
</head>
<body>
<div class="wrap">
    <header class="header">
        <div>
            <h1>سجل تدريب ميزان أنزان</h1>
            <div class="meta">
                الطالب: <strong><?= e($studentName) ?></strong>
                <br>
                كود الطالب: <span class="code"><?= e($displayCode) ?></span>
            </div>
        </div>
        <a class="back" href="index.html">← العودة إلى التدريب</a>
    </header>

    <section class="card">
        <?php if ($pageError !== ''): ?>
            <div class="notice"><?= e($pageError) ?></div>
        <?php elseif (!$rows): ?>
            <div class="notice">لا توجد نتائج مسجلة لهذا الطالب حتى الآن.</div>
        <?php else: ?>
            <div class="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>التاريخ</th>
                        <th>المستوى</th>
                        <th>النمط</th>
                        <th>العملية</th>
                        <th>الخانات</th>
                        <th>الصفوف</th>
                        <th>الصحيح</th>
                        <th>الدقة</th>
                        <th>النقاط</th>
                        <th>الزمن</th>
                        <th>التقرير</th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($rows as $index => $row): ?>
                        <tr>
                            <td><?= $index + 1 ?></td>
                            <td><?= fmtDate($row['created_at'] ?? '') ?></td>
                            <td><?= e($row['level'] ?? 'L1') ?></td>
                            <td><?= e($row['training_mode'] ?? '—') ?></td>
                            <td><?= e($row['operation_type'] ?? '—') ?></td>
                            <td><?= (int)($row['digits_count'] ?? 0) ?></td>
                            <td><?= (int)($row['rows_count'] ?? 0) ?></td>
                            <td><?= (int)($row['correct_answers'] ?? 0) ?> / <?= (int)($row['total_questions'] ?? 0) ?></td>
                            <td class="accuracy"><?= fmtNumber($row['accuracy_percentage'] ?? 0) ?>%</td>
                            <td class="score"><?= (int)($row['score'] ?? 0) ?></td>
                            <td><?= (int)($row['time_taken_seconds'] ?? $row['duration_seconds'] ?? 0) ?> ث</td>
                            <td><a class="report" href="generate_report.php?id=<?= (int)$row['id'] ?>">عرض التقرير</a></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </section>
</div>
</body>
</html>
