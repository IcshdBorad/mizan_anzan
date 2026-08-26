<?php
declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| ميزان أنزان
| التقرير التفصيلي لنتيجة التحدي
|--------------------------------------------------------------------------
|
| المسار:
| /public_html/mizan_anzan/generate_report.php
|
| يعتمد على:
| /public_html/mizan_anzan/includes/db.php
|
| الجدول:
| anzan_results
|
|--------------------------------------------------------------------------
*/

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

require_once __DIR__ . '/includes/db.php';

/*
|--------------------------------------------------------------------------
| التحقق من اتصال PDO
|--------------------------------------------------------------------------
*/

if (!isset($pdo) || !($pdo instanceof PDO)) {
    http_response_code(500);
    exit('خطأ في اتصال قاعدة البيانات.');
}

/*
|--------------------------------------------------------------------------
| دوال مساعدة
|--------------------------------------------------------------------------
*/

function e(mixed $value): string
{
    return htmlspecialchars(
        (string) $value,
        ENT_QUOTES | ENT_SUBSTITUTE,
        'UTF-8'
    );
}

function numberValue(
    mixed $value,
    int $decimals = 2
): string {
    if ($value === null || $value === '') {
        return '—';
    }

    return number_format(
        (float) $value,
        $decimals
    );
}

function formatDateValue(mixed $value): string
{
    if ($value === null || $value === '') {
        return '—';
    }

    $timestamp = strtotime((string) $value);

    if ($timestamp === false) {
        return e($value);
    }

    return date(
        'Y-m-d H:i',
        $timestamp
    );
}

function failPage(
    string $message,
    int $status = 404
): void {
    http_response_code($status);
    ?>
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">

    <head>

        <meta charset="UTF-8">

        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
        >

        <title>تقرير أنزان</title>

        <style>

            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                min-height: 100vh;

                display: flex;
                align-items: center;
                justify-content: center;

                padding: 24px;

                background: #f1f5f9;

                font-family:
                    "Segoe UI",
                    Tahoma,
                    Arial,
                    sans-serif;

                color: #1e293b;
            }

            .error-card {
                width: 100%;
                max-width: 560px;

                background: #ffffff;

                border-radius: 20px;

                padding: 40px 30px;

                text-align: center;

                box-shadow:
                    0 15px 45px
                    rgba(15, 23, 42, .10);
            }

            .error-icon {
                font-size: 52px;
                margin-bottom: 18px;
            }

            .error-card h1 {
                margin: 0 0 12px;
                font-size: 25px;
            }

            .error-card p {
                margin: 0 0 25px;

                color: #64748b;

                line-height: 1.8;
            }

            .back-button {
                display: inline-block;

                padding: 12px 22px;

                border-radius: 10px;

                background: #0284c7;

                color: #ffffff;

                text-decoration: none;

                font-weight: 700;
            }

            .back-button:hover {
                background: #0369a1;
            }

        </style>

    </head>

    <body>

        <div class="error-card">

            <div class="error-icon">
                📄
            </div>

            <h1>
                تعذر عرض التقرير
            </h1>

            <p>
                <?= e($message) ?>
            </p>

            <a
                href="javascript:history.back()"
                class="back-button"
            >
                العودة
            </a>

        </div>

    </body>

    </html>
    <?php

    exit;
}

/*
|--------------------------------------------------------------------------
| قراءة رقم النتيجة
|--------------------------------------------------------------------------
*/

$resultId = filter_input(
    INPUT_GET,
    'id',
    FILTER_VALIDATE_INT
);

if ($resultId === false || $resultId === null || $resultId <= 0) {

    failPage(
        'رقم التقرير غير صحيح.'
    );
}

/*
|--------------------------------------------------------------------------
| جلب النتيجة
|--------------------------------------------------------------------------
*/

try {

    $stmt = $pdo->prepare(
        "
        SELECT *
        FROM anzan_results
        WHERE id = :id
        LIMIT 1
        "
    );

    $stmt->execute([
        ':id' => $resultId
    ]);

    $current = $stmt->fetch(
        PDO::FETCH_ASSOC
    );

} catch (Throwable $e) {

    error_log(
        'ANZAN report fetch error: ' .
        $e->getMessage()
    );

    failPage(
        'حدث خطأ أثناء قراءة بيانات التقرير.',
        500
    );
}

if (!$current) {

    failPage(
        'التقرير المطلوب غير موجود.'
    );
}

/*
|--------------------------------------------------------------------------
| هوية الطالب من الجلسة
|--------------------------------------------------------------------------
*/

$sessionStudentId = null;

if (
    isset($_SESSION['student_id']) &&
    $_SESSION['student_id'] !== ''
) {
    $sessionStudentId = (int) $_SESSION['student_id'];
}

$sessionStudentCode = trim(
    (string) (
        $_SESSION['student_code'] ?? ''
    )
);

/*
|--------------------------------------------------------------------------
| هوية الطالب الموجودة في النتيجة
|--------------------------------------------------------------------------
*/

$resultStudentId = null;

if (
    isset($current['student_id']) &&
    $current['student_id'] !== ''
) {
    $resultStudentId = (int) $current['student_id'];
}

$resultStudentCode = trim(
    (string) (
        $current['student_code'] ?? ''
    )
);

/*
|--------------------------------------------------------------------------
| حماية التقرير
|--------------------------------------------------------------------------
|
| القاعدة:
|
| 1. إذا كانت الجلسة تحتوي student_id والنتيجة تحتوي student_id
|    يجب أن يتطابقا.
|
| 2. إذا كان student_id غير متوفر في النتيجة،
|    يمكن استخدام student_code إذا كان موجوداً.
|
| 3. إذا كان كلا المعرّفين موجودين في الجلسة والنتيجة،
|    يجب عدم وجود تعارض بينهما.
|
| 4. بدون هوية طالب في الجلسة يتم منع العرض.
|
|--------------------------------------------------------------------------
*/

if ($sessionStudentId !== null) {

    /*
    |--------------------------------------------------------------
    | لدينا student_id في الجلسة
    |--------------------------------------------------------------
    */

    if ($resultStudentId !== null) {

        /*
        | إذا كان هناك student_id في النتيجة
        | فهو المرجع الأساسي.
        */

        if (
            $resultStudentId <= 0 ||
            $resultStudentId !== $sessionStudentId
        ) {

            failPage(
                'لا تملك صلاحية عرض هذا التقرير.',
                403
            );
        }

        /*
        | إذا كان student_code موجوداً في الطرفين،
        | نتحقق من عدم وجود تعارض.
        */

        if (
            $sessionStudentCode !== '' &&
            $resultStudentCode !== '' &&
            !hash_equals(
                $sessionStudentCode,
                $resultStudentCode
            )
        ) {

            failPage(
                'لا تملك صلاحية عرض هذا التقرير.',
                403
            );
        }

    } else {

        /*
        | لا يوجد student_id في النتيجة،
        | لذلك نستخدم student_code كبديل.
        */

        if (
            $sessionStudentCode === '' ||
            $resultStudentCode === '' ||
            !hash_equals(
                $sessionStudentCode,
                $resultStudentCode
            )
        ) {

            failPage(
                'لا تملك صلاحية عرض هذا التقرير.',
                403
            );
        }
    }

} elseif ($sessionStudentCode !== '') {

    /*
    |--------------------------------------------------------------
    | لا يوجد student_id في الجلسة
    | لكن يوجد student_code
    |--------------------------------------------------------------
    */

    if (
        $resultStudentCode === '' ||
        !hash_equals(
            $sessionStudentCode,
            $resultStudentCode
        )
    ) {

        failPage(
            'لا تملك صلاحية عرض هذا التقرير.',
            403
        );
    }

} else {

    /*
    |--------------------------------------------------------------
    | لا توجد هوية طالب في الجلسة
    |--------------------------------------------------------------
    */

    failPage(
        'يجب الدخول إلى حساب الطالب أولاً لعرض التقرير.',
        403
    );
}

/*
|--------------------------------------------------------------------------
| بيانات الطالب
|--------------------------------------------------------------------------
|
| جدول anzan_results الذي أرسلته لا يحتوي student_name.
| لذلك نستخدم الجلسة كبديل.
|
|--------------------------------------------------------------------------
*/

$studentName = trim(
    (string) (
        $current['student_name']
        ?? $current['full_name']
        ?? $_SESSION['student_name']
        ?? 'طالب أنزان'
    )
);

if ($studentName === '') {
    $studentName = 'طالب أنزان';
}

$country = trim(
    (string) (
        $current['country']
        ?? $_SESSION['country']
        ?? ''
    )
);

$studentCode = trim(
    (string) (
        $current['student_code']
        ?? $_SESSION['student_code']
        ?? ''
    )
);

$ageCategory = trim(
    (string) (
        $current['age_category']
        ?? ''
    )
);

/*
|--------------------------------------------------------------------------
| بيانات التحدي
|--------------------------------------------------------------------------
*/

$challengeType = trim(
    (string) (
        $current['challenge_type_text']
        ?? $current['challenge_type']
        ?? 'تحدي أنزان'
    )
);

if ($challengeType === '') {
    $challengeType = 'تحدي أنزان';
}

$digitsCount = $current['digits_count']
    ?? null;

$rowsCount = $current['rows_count']
    ?? null;

$speedMs = $current['speed_ms']
    ?? null;

$operationType = trim(
    (string) (
        $current['operation_type']
        ?? ''
    )
);

$trainingMode = trim(
    (string) (
        $current['training_mode']
        ?? ''
    )
);

$preset = trim(
    (string) (
        $current['preset']
        ?? ''
    )
);

/*
|--------------------------------------------------------------------------
| بيانات النتيجة
|--------------------------------------------------------------------------
*/

$correctAnswers = (int) (
    $current['correct_answers']
    ?? $current['score']
    ?? 0
);

$totalQuestions = (int) (
    $current['total_questions']
    ?? 0
);

$score = (int) (
    $current['score']
    ?? $correctAnswers
);

$accuracy = $current['accuracy_percentage']
    ?? null;

/*
|--------------------------------------------------------------------------
| حساب الدقة إذا لم تكن محفوظة
|--------------------------------------------------------------------------
*/

if (
    $accuracy === null &&
    $totalQuestions > 0
) {

    $accuracy = round(
        (
            $correctAnswers /
            $totalQuestions
        ) * 100,
        2
    );
}

if ($accuracy === null) {
    $accuracy = 0;
}

$accuracy = (float) $accuracy;

/*
|--------------------------------------------------------------------------
| مدة التحدي
|--------------------------------------------------------------------------
*/

$durationSeconds = (int) (
    $current['duration_seconds']
    ?? $current['time_taken_seconds']
    ?? 0
);

/*
|--------------------------------------------------------------------------
| متوسط زمن السؤال
|--------------------------------------------------------------------------
*/

$avgTime = $current['avg_time_per_question']
    ?? null;

if (
    $avgTime === null &&
    $durationSeconds > 0 &&
    $totalQuestions > 0
) {

    $avgTime =
        $durationSeconds /
        $totalQuestions;
}

$createdAt = $current['created_at']
    ?? '';

/*
|--------------------------------------------------------------------------
| البحث عن المحاولة السابقة
|--------------------------------------------------------------------------
*/

$previous = null;

try {

    if (
        $resultStudentId !== null &&
        $resultStudentId > 0
    ) {

        $stmtPrevious = $pdo->prepare(
            "
            SELECT *
            FROM anzan_results
            WHERE student_id = :student_id
              AND id < :id
            ORDER BY id DESC
            LIMIT 1
            "
        );

        $stmtPrevious->execute([
            ':student_id' => $resultStudentId,
            ':id' => $resultId
        ]);

        $previous =
            $stmtPrevious->fetch(
                PDO::FETCH_ASSOC
            );

    } elseif ($resultStudentCode !== '') {

        $stmtPrevious = $pdo->prepare(
            "
            SELECT *
            FROM anzan_results
            WHERE student_code = :student_code
              AND id < :id
            ORDER BY id DESC
            LIMIT 1
            "
        );

        $stmtPrevious->execute([
            ':student_code' => $resultStudentCode,
            ':id' => $resultId
        ]);

        $previous =
            $stmtPrevious->fetch(
                PDO::FETCH_ASSOC
            );
    }

} catch (Throwable $e) {

    error_log(
        'ANZAN previous result error: ' .
        $e->getMessage()
    );

    $previous = null;
}

/*
|--------------------------------------------------------------------------
| تحليل التطور
|--------------------------------------------------------------------------
*/

$status = 'neutral';

$badge = '⚪ بداية المسار';

$message =
    'هذه إحدى محاولاتك المسجلة في أنزان. استمر في التدريب المنتظم.';

$accuracyDifference = null;

$durationDifference = null;

if ($previous) {

    /*
    |--------------------------------------------------------------
    | بيانات المحاولة السابقة
    |--------------------------------------------------------------
    */

    $previousCorrect = (int) (
        $previous['correct_answers']
        ?? $previous['score']
        ?? 0
    );

    $previousTotal = (int) (
        $previous['total_questions']
        ?? 0
    );

    $previousAccuracy =
        $previous['accuracy_percentage']
        ?? null;

    /*
    | حساب دقة المحاولة السابقة عند الحاجة
    */

    if (
        $previousAccuracy === null &&
        $previousTotal > 0
    ) {

        $previousAccuracy = round(
            (
                $previousCorrect /
                $previousTotal
            ) * 100,
            2
        );
    }

    $previousAccuracy =
        (float) (
            $previousAccuracy ?? 0
        );

    /*
    |--------------------------------------------------------------
    | فرق الدقة
    |--------------------------------------------------------------
    */

    $currentAccuracy =
        (float) $accuracy;

    $accuracyDifference =
        round(
            $currentAccuracy -
            $previousAccuracy,
            2
        );

    /*
    |--------------------------------------------------------------
    | فرق الزمن
    |--------------------------------------------------------------
    |
    | موجب = الوقت الحالي أقل = أسرع
    | سالب = الوقت الحالي أكبر = أبطأ
    |
    */

    $previousDuration = (int) (
        $previous['duration_seconds']
        ?? $previous['time_taken_seconds']
        ?? 0
    );

    $durationDifference =
        $previousDuration -
        $durationSeconds;

    /*
    |--------------------------------------------------------------
    | التقييم الأساسي يعتمد على الدقة
    |--------------------------------------------------------------
    */

    if ($accuracyDifference > 0) {

        $status = 'positive';

        $badge =
            '📈 تطور إيجابي';

        $message =
            'أحسنت! تحسنت دقة أدائك مقارنة بمحاولتك السابقة.';

    } elseif ($accuracyDifference < 0) {

        $status = 'negative';

        $badge =
            '📊 فرصة للتحسين';

        $message =
            'هناك انخفاض في الدقة مقارنة بالمحاولة السابقة. ركّز على الثبات والدقة في التحدي القادم.';

    } else {

        $status = 'stable';

        $badge =
            '➡️ أداء مستقر';

        $message =
            'حافظت على مستوى دقة قريب من محاولتك السابقة. الاستمرار سيصنع الفارق.';
    }
}

/*
|--------------------------------------------------------------------------
| عنوان الصفحة
|--------------------------------------------------------------------------
*/

$pageTitle =
    'تقرير أداء أنزان - ' .
    $studentName;

?>
<!DOCTYPE html>

<html
    lang="ar"
    dir="rtl"
>

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        <?= e($pageTitle) ?>
    </title>

    <style>

        * {
            box-sizing: border-box;
        }

        :root {
            --primary: #0284c7;
            --primary-dark: #0369a1;

            --text: #0f172a;
            --muted: #64748b;

            --border: #e2e8f0;

            --surface: #ffffff;

            --background: #f1f5f9;
        }

        body {

            margin: 0;

            min-height: 100vh;

            background:
                linear-gradient(
                    135deg,
                    #f8fafc 0%,
                    #eef6ff 100%
                );

            color: var(--text);

            font-family:
                "Segoe UI",
                Tahoma,
                Arial,
                sans-serif;

            line-height: 1.7;
        }

        .page {

            width: 100%;

            max-width: 980px;

            margin: 0 auto;

            padding:
                30px
                18px
                50px;
        }

        .report-card {

            background:
                var(--surface);

            border:
                1px solid
                rgba(226, 232, 240, .9);

            border-radius: 24px;

            overflow: hidden;

            box-shadow:
                0 20px 60px
                rgba(15, 23, 42, .09);
        }

        /*
        |--------------------------------------------------------------------------
        | رأس التقرير
        |--------------------------------------------------------------------------
        */

        .report-header {

            padding:
                34px
                30px;

            text-align: center;

            background:
                linear-gradient(
                    135deg,
                    #ffffff,
                    #f0f9ff
                );

            border-bottom:
                1px solid
                var(--border);
        }

        .brand {

            font-size: 15px;

            font-weight: 800;

            color:
                var(--primary);

            margin-bottom: 8px;
        }

        .report-header h1 {

            margin: 0;

            font-size:
                clamp(
                    25px,
                    5vw,
                    36px
                );
        }

        .report-header p {

            margin:
                8px
                0
                0;

            color:
                var(--muted);
        }

        /*
        |--------------------------------------------------------------------------
        | المحتوى
        |--------------------------------------------------------------------------
        */

        .content {

            padding: 30px;
        }

        /*
        |--------------------------------------------------------------------------
        | بيانات الطالب
        |--------------------------------------------------------------------------
        */

        .student-card {

            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(0, 1fr)
                );

            gap: 14px;

            margin-bottom: 25px;
        }

        .info-box {

            padding: 16px;

            background:
                #f8fafc;

            border:
                1px solid
                var(--border);

            border-radius: 14px;
        }

        .info-label {

            display: block;

            color:
                var(--muted);

            font-size: 13px;

            margin-bottom: 4px;
        }

        .info-value {

            font-weight: 750;

            word-break:
                break-word;
        }

        /*
        |--------------------------------------------------------------------------
        | عناوين الأقسام
        |--------------------------------------------------------------------------
        */

        .section-title {

            margin:
                28px
                0
                14px;

            font-size: 20px;
        }

        /*
        |--------------------------------------------------------------------------
        | المؤشرات
        |--------------------------------------------------------------------------
        */

        .metrics {

            display: grid;

            grid-template-columns:
                repeat(
                    4,
                    minmax(0, 1fr)
                );

            gap: 14px;
        }

        .metric {

            padding:
                22px
                15px;

            text-align: center;

            border-radius: 16px;

            border:
                1px solid
                var(--border);

            background:
                #ffffff;
        }

        .metric.primary {

            background:
                #eff6ff;

            border-color:
                #bfdbfe;
        }

        .metric.success {

            background:
                #ecfdf5;

            border-color:
                #a7f3d0;
        }

        .metric-label {

            color:
                var(--muted);

            font-size: 13px;

            margin-bottom: 7px;
        }

        .metric-value {

            font-size: 25px;

            font-weight: 850;
        }

        .metric-unit {

            font-size: 12px;

            color:
                var(--muted);
        }

        /*
        |--------------------------------------------------------------------------
        | إعدادات التحدي
        |--------------------------------------------------------------------------
        */

        .challenge-grid {

            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(0, 1fr)
                );

            gap: 14px;
        }

        .challenge-box {

            padding: 16px;

            background:
                #f8fafc;

            border:
                1px solid
                var(--border);

            border-radius: 14px;
        }

        .challenge-box strong {

            display: block;

            margin-bottom: 3px;
        }

        /*
        |--------------------------------------------------------------------------
        | التقييم
        |--------------------------------------------------------------------------
        */

        .evaluation {

            margin-top: 26px;

            padding: 24px;

            border-radius: 18px;

            text-align: center;
        }

        .evaluation-positive {

            background:
                #ecfdf5;

            color:
                #065f46;

            border:
                1px solid
                #a7f3d0;
        }

        .evaluation-negative {

            background:
                #fef2f2;

            color:
                #991b1b;

            border:
                1px solid
                #fecaca;
        }

        .evaluation-stable {

            background:
                #fffbeb;

            color:
                #92400e;

            border:
                1px solid
                #fde68a;
        }

        .evaluation-neutral {

            background:
                #f0f9ff;

            color:
                #075985;

            border:
                1px solid
                #bae6fd;
        }

        .evaluation-badge {

            font-size: 20px;

            font-weight: 850;

            margin-bottom: 7px;
        }

        .evaluation p {

            margin: 0;
        }

        .comparison {

            margin-top: 14px;

            font-size: 13px;

            opacity: .9;

            line-height: 1.9;
        }

        /*
        |--------------------------------------------------------------------------
        | الأزرار
        |--------------------------------------------------------------------------
        */

        .actions {

            display: flex;

            justify-content: center;

            gap: 12px;

            flex-wrap: wrap;

            margin-top: 30px;
        }

        .button {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            gap: 7px;

            min-height: 46px;

            padding:
                10px
                20px;

            border-radius: 11px;

            border: 0;

            text-decoration: none;

            cursor: pointer;

            font-family: inherit;

            font-size: 15px;

            font-weight: 800;

            transition:
                transform .2s ease,
                background .2s ease;
        }

        .button:hover {

            transform:
                translateY(-1px);
        }

        .button-primary {

            background:
                var(--primary);

            color:
                #ffffff;
        }

        .button-primary:hover {

            background:
                var(--primary-dark);
        }

        .button-secondary {

            background:
                #e2e8f0;

            color:
                #334155;
        }

        .button-secondary:hover {

            background:
                #cbd5e1;
        }

        /*
        |--------------------------------------------------------------------------
        | التذييل
        |--------------------------------------------------------------------------
        */

        .report-footer {

            text-align: center;

            margin-top: 25px;

            color:
                var(--muted);

            font-size: 12px;
        }

        /*
        |--------------------------------------------------------------------------
        | الأجهزة المتوسطة
        |--------------------------------------------------------------------------
        */

        @media (max-width: 800px) {

            .student-card {

                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
            }

            .metrics {

                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
            }

            .challenge-grid {

                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | الهاتف
        |--------------------------------------------------------------------------
        */

        @media (max-width: 520px) {

            .page {

                padding:
                    12px
                    8px
                    30px;
            }

            .report-header {

                padding:
                    25px
                    18px;
            }

            .content {

                padding:
                    20px
                    15px;
            }

            .student-card,
            .metrics,
            .challenge-grid {

                grid-template-columns:
                    1fr;
            }

            .metric-value {

                font-size: 23px;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | الطباعة / PDF
        |--------------------------------------------------------------------------
        */

        @media print {

            body {

                background:
                    #ffffff;
            }

            .page {

                max-width: none;

                padding: 0;
            }

            .report-card {

                box-shadow: none;

                border: 0;

                border-radius: 0;
            }

            .actions {

                display: none;
            }

            .report-footer {

                margin-top: 15px;
            }

            .evaluation {

                break-inside: avoid;
            }

            .metric,
            .info-box,
            .challenge-box {

                break-inside: avoid;
            }
        }

    </style>

</head>

<body>

<div class="page">

    <div class="report-card">

        <!--
        |--------------------------------------------------------------------------
        | رأس التقرير
        |--------------------------------------------------------------------------
        -->

        <header class="report-header">

            <div class="brand">
                ⚖️ ميزان أنزان
            </div>

            <h1>
                📊 تقرير أداء التحدي
            </h1>

            <p>

                <?= e($challengeType) ?>

                —

                <?= formatDateValue($createdAt) ?>

            </p>

        </header>


        <main class="content">

            <!--
            |--------------------------------------------------------------------------
            | بيانات الطالب
            |--------------------------------------------------------------------------
            -->

            <h2 class="section-title">
                👤 بيانات الطالب
            </h2>

            <div class="student-card">

                <div class="info-box">

                    <span class="info-label">
                        اسم الطالب
                    </span>

                    <span class="info-value">
                        <?= e($studentName) ?>
                    </span>

                </div>


                <div class="info-box">

                    <span class="info-label">
                        الدولة
                    </span>

                    <span class="info-value">

                        <?= $country !== ''
                            ? '🌍 ' . e($country)
                            : 'غير محددة'
                        ?>

                    </span>

                </div>


                <div class="info-box">

                    <span class="info-label">
                        كود أنزان
                    </span>

                    <span class="info-value">

                        <?= $studentCode !== ''
                            ? e($studentCode)
                            : '—'
                        ?>

                    </span>

                </div>


                <?php if ($ageCategory !== ''): ?>

                    <div class="info-box">

                        <span class="info-label">
                            الفئة العمرية
                        </span>

                        <span class="info-value">
                            <?= e($ageCategory) ?>
                        </span>

                    </div>

                <?php endif; ?>

            </div>


            <!--
            |--------------------------------------------------------------------------
            | المؤشرات الأساسية
            |--------------------------------------------------------------------------
            -->

            <h2 class="section-title">
                🎯 المؤشرات الأساسية
            </h2>

            <div class="metrics">

                <div class="metric primary">

                    <div class="metric-label">
                        النتيجة
                    </div>

                    <div class="metric-value">

                        <?= $score ?>

                        <?php if ($totalQuestions > 0): ?>

                            <span
                                style="
                                    font-size:14px;
                                    font-weight:600;
                                "
                            >
                                / <?= $totalQuestions ?>
                            </span>

                        <?php endif; ?>

                    </div>

                </div>


                <div class="metric success">

                    <div class="metric-label">
                        نسبة الدقة
                    </div>

                    <div class="metric-value">

                        <?= numberValue(
                            $accuracy,
                            2
                        ) ?>%

                    </div>

                </div>


                <div class="metric">

                    <div class="metric-label">
                        مدة التحدي
                    </div>

                    <div class="metric-value">
                        <?= $durationSeconds ?>
                    </div>

                    <div class="metric-unit">
                        ثانية
                    </div>

                </div>


                <div class="metric">

                    <div class="metric-label">
                        متوسط السؤال
                    </div>

                    <div class="metric-value">

                        <?php if ($avgTime !== null): ?>

                            <?= numberValue(
                                $avgTime,
                                2
                            ) ?>

                        <?php else: ?>

                            —

                        <?php endif; ?>

                    </div>

                    <div class="metric-unit">
                        ثانية
                    </div>

                </div>

            </div>


            <!--
            |--------------------------------------------------------------------------
            | إعدادات التحدي
            |--------------------------------------------------------------------------
            -->

            <h2 class="section-title">
                ⚙️ إعدادات التحدي
            </h2>

            <div class="challenge-grid">

                <div class="challenge-box">

                    <strong>
                        الخانات
                    </strong>

                    <?= $digitsCount !== null
                        ? (int) $digitsCount
                        : '—'
                    ?>

                </div>


                <div class="challenge-box">

                    <strong>
                        الصفوف
                    </strong>

                    <?= $rowsCount !== null
                        ? (int) $rowsCount
                        : '—'
                    ?>

                </div>


                <div class="challenge-box">

                    <strong>
                        سرعة الظهور
                    </strong>

                    <?= $speedMs !== null
                        ? (int) $speedMs . ' ms'
                        : '—'
                    ?>

                </div>


                <?php if ($operationType !== ''): ?>

                    <div class="challenge-box">

                        <strong>
                            العملية
                        </strong>

                        <?= e($operationType) ?>

                    </div>

                <?php endif; ?>


                <?php if ($trainingMode !== ''): ?>

                    <div class="challenge-box">

                        <strong>
                            نمط التدريب
                        </strong>

                        <?= e($trainingMode) ?>

                    </div>

                <?php endif; ?>


                <?php if ($preset !== ''): ?>

                    <div class="challenge-box">

                        <strong>
                            الإعداد
                        </strong>

                        <?= e($preset) ?>

                    </div>

                <?php endif; ?>

            </div>


            <!--
            |--------------------------------------------------------------------------
            | تقييم التطور
            |--------------------------------------------------------------------------
            -->

            <div
                class="
                    evaluation
                    evaluation-<?= e($status) ?>
                "
            >

                <div class="evaluation-badge">
                    <?= e($badge) ?>
                </div>

                <p>
                    <?= e($message) ?>
                </p>


                <?php if ($previous): ?>

                    <div class="comparison">

                        <strong>
                            مقارنة بالمحاولة السابقة
                        </strong>

                        <br>

                        تاريخ المحاولة السابقة:

                        <?= formatDateValue(
                            $previous['created_at']
                            ?? ''
                        ) ?>


                        <?php if (
                            $accuracyDifference !== null
                        ): ?>

                            <br>

                            تغير الدقة:

                            <strong>

                                <?= $accuracyDifference > 0
                                    ? '+'
                                    : ''
                                ?>

                                <?= numberValue(
                                    $accuracyDifference,
                                    2
                                ) ?>%

                            </strong>

                        <?php endif; ?>


                        <?php if (
                            $durationDifference !== null
                        ): ?>

                            <br>

                            <?php if (
                                $durationDifference > 0
                            ): ?>

                                تحسن في السرعة:

                                <strong>
                                    <?= abs(
                                        $durationDifference
                                    ) ?>
                                    ثانية
                                </strong>

                            <?php elseif (
                                $durationDifference < 0
                            ): ?>

                                زيادة في الزمن:

                                <strong>
                                    <?= abs(
                                        $durationDifference
                                    ) ?>
                                    ثانية
                                </strong>

                            <?php else: ?>

                                الزمن:

                                <strong>
                                    لم يتغير
                                </strong>

                            <?php endif; ?>

                        <?php endif; ?>

                    </div>

                <?php endif; ?>

            </div>


            <!--
            |--------------------------------------------------------------------------
            | الأزرار
            |--------------------------------------------------------------------------
            -->

            <div class="actions">

                <button
                    type="button"
                    class="
                        button
                        button-primary
                    "
                    onclick="window.print()"
                >
                    📥 طباعة / حفظ PDF
                </button>


                <a
                    href="javascript:history.back()"
                    class="
                        button
                        button-secondary
                    "
                >
                    ← العودة للسجل
                </a>

            </div>


            <!--
            |--------------------------------------------------------------------------
            | التذييل
            |--------------------------------------------------------------------------
            -->

            <div class="report-footer">

                ميزان أنزان — تقرير تدريبي

                <br>

                هذا التقرير يعكس بيانات التحدي المسجلة في المنصة.

            </div>

        </main>

    </div>

</div>

</body>

</html>