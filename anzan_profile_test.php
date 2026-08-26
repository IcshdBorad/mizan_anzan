<?php
/**
 * صفحة اختبار ملف العبقري
 *
 * المسار:
 * /public_html/mizan_anzan/anzan_profile_test.php
 */

declare(strict_types=1);

$anzId = trim(
    $_GET['anz_id'] ??
    ''
);

if ($anzId === '') {

    $anzId = 'ANZ-TEST01';
}

?>
<!DOCTYPE html>

<html lang="ar" dir="rtl">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
    >

    <title>
        ملف العبقري | ميزان أنزان
    </title>

    <link
        rel="stylesheet"
        href="css/anzan_profile.css"
    >

</head>


<body
    style="
        margin:0;
        min-height:100vh;
        background:#050b16;
    "
>


<div
    class="anzan-profile"
    data-anz-id="<?= htmlspecialchars(
        $anzId,
        ENT_QUOTES,
        'UTF-8'
    ) ?>"
>


    <section
        class="anzan-profile-hero"
    >

        <div
            class="anzan-profile-id"
        >
            ANZ ID:
            <span id="anzanProfileId">
                <?= htmlspecialchars(
                    $anzId,
                    ENT_QUOTES,
                    'UTF-8'
                ) ?>
            </span>
        </div>


        <h1
            class="anzan-profile-name"
            id="anzanProfileName"
        >
            ملف العبقري
        </h1>


        <p
            class="anzan-profile-subtitle"
        >
            هويتك الرقمية في ميزان أنزان
        </p>


        <div
            style="
                display:flex;
                gap:10px;
                margin-top:18px;
                flex-wrap:wrap;
            "
        >

            <span
                style="
                    padding:8px 14px;
                    border-radius:30px;
                    background:#17243d;
                    color:#ffd21a;
                "
            >
                المستوى:
                <strong id="anzanProfileLevel">
                    —
                </strong>
            </span>


            <span
                style="
                    padding:8px 14px;
                    border-radius:30px;
                    background:#17243d;
                    color:#b66cff;
                "
            >
                الرتبة:
                <strong id="anzanProfileRank">
                    —
                </strong>
            </span>

        </div>


        <!-- مؤشر أنزان -->

        <div
            class="anzan-index-card"
        >

            <div
                class="anzan-index-label"
            >
                مؤشر أنزان
            </div>

            <div
                class="anzan-index"
                id="anzanIndex"
            >
                —
            </div>

        </div>


        <!-- المؤشرات -->

        <div
            class="anzan-metrics"
        >

            <div class="anzan-metric">

                <div
                    class="anzan-metric-title"
                >
                    🧠 التركيز
                </div>

                <div
                    class="anzan-metric-value"
                    id="focusScore"
                >
                    —
                </div>

                <div
                    class="anzan-progress"
                >
                    <div
                        class="anzan-progress-bar"
                        id="focusProgress"
                    ></div>
                </div>

            </div>


            <div class="anzan-metric">

                <div
                    class="anzan-metric-title"
                >
                    🎯 الدقة
                </div>

                <div
                    class="anzan-metric-value"
                    id="accuracyScore"
                >
                    —
                </div>

                <div
                    class="anzan-progress"
                >
                    <div
                        class="anzan-progress-bar"
                        id="accuracyProgress"
                    ></div>
                </div>

            </div>


            <div class="anzan-metric">

                <div
                    class="anzan-metric-title"
                >
                    ⚡ السرعة
                </div>

                <div
                    class="anzan-metric-value"
                    id="speedScore"
                >
                    —
                </div>

                <div
                    class="anzan-progress"
                >
                    <div
                        class="anzan-progress-bar"
                        id="speedProgress"
                    ></div>
                </div>

            </div>


            <div class="anzan-metric">

                <div
                    class="anzan-metric-title"
                >
                    📈 التطور
                </div>

                <div
                    class="anzan-metric-value"
                    id="developmentScore"
                >
                    —
                </div>

                <div
                    class="anzan-progress"
                >
                    <div
                        class="anzan-progress-bar"
                        id="developmentProgress"
                    ></div>
                </div>

            </div>


            <div class="anzan-metric">

                <div
                    class="anzan-metric-title"
                >
                    🔢 الثبات
                </div>

                <div
                    class="anzan-metric-value"
                    id="consistencyScore"
                >
                    —
                </div>

                <div
                    class="anzan-progress"
                >
                    <div
                        class="anzan-progress-bar"
                        id="consistencyProgress"
                    ></div>
                </div>

            </div>

        </div>


        <!-- توصية أنزان -->

        <div
            class="anzan-recommendation"
        >

            <div
                class="anzan-recommendation-title"
            >
                ✨ أنزان يقرأ تقدمك
            </div>

            <p
                class="anzan-recommendation-text"
                id="recommendation"
            >
                جاري تحليل ملفك...
            </p>

        </div>


        <!-- إحصائيات -->

        <div
            class="anzan-secondary-stats"
        >

            <div class="anzan-stat">

                <div
                    class="anzan-stat-value"
                    id="totalSessions"
                >
                    0
                </div>

                <div
                    class="anzan-stat-label"
                >
                    جلسات التدريب
                </div>

            </div>


            <div class="anzan-stat">

                <div
                    class="anzan-stat-value"
                    id="totalQuestions"
                >
                    0
                </div>

                <div
                    class="anzan-stat-label"
                >
                    إجمالي الأسئلة
                </div>

            </div>


            <div class="anzan-stat">

                <div
                    class="anzan-stat-value"
                    id="currentStreak"
                >
                    0
                </div>

                <div
                    class="anzan-stat-label"
                >
                    سلسلة متتالية
                </div>

            </div>

        </div>


        <div
            id="anzanProfileError"
            hidden
            style="
                margin-top:20px;
                padding:15px;
                border-radius:12px;
                background:rgba(220,50,50,.12);
                color:#ff8b8b;
            "
        ></div>


    </section>

</div>


<script
    src="js/anzan_profile.js"
    defer
></script>

</body>

</html>