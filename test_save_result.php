<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| ميزان أنزان
| اختبار API حفظ نتيجة تحدي أنزان - محمي
|--------------------------------------------------------------------------
|
| هذا الملف يرسل طلب POST حقيقي إلى:
|
| /mizan_anzan/api/save-result.php
|
| الحماية هنا مستقلة عن API وقاعدة البيانات.
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| إعدادات الحماية
|--------------------------------------------------------------------------
|
| استخدم نفس المفتاح الذي استخدمته في test_db.php
|
| لا تستخدم كلمة مرور قاعدة البيانات هنا.
|
|--------------------------------------------------------------------------
*/

$debugKey =
    'MIZAN_ANZAN_2026';


/*
|--------------------------------------------------------------------------
| التحقق من رمز الوصول
|--------------------------------------------------------------------------
*/

$providedKey =
    isset($_GET['key'])
        ? (string)$_GET['key']
        : '';


if (
    $providedKey === '' ||
    !hash_equals(
        $debugKey,
        $providedKey
    )
) {

    http_response_code(403);

    header(
        'Content-Type: text/html; charset=utf-8'
    );

    echo '<!DOCTYPE html>';

    echo '<html lang="ar" dir="rtl">';

    echo '<head>';

    echo '<meta charset="UTF-8">';

    echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">';

    echo '<title>غير مصرح</title>';


    echo '<style>

    body {
        font-family: Arial, sans-serif;
        background: #f5f5f5;
        padding: 40px;
    }

    .box {
        max-width: 650px;
        margin: auto;
        background: #fff;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 5px 25px rgba(0,0,0,.08);
    }

    .error {
        background: #fdecec;
        color: #9b1c1c;
        padding: 15px;
        border-radius: 8px;
        font-weight: bold;
    }

    </style>';


    echo '</head>';

    echo '<body>';

    echo '<div class="box">';

    echo '<h2>🔒 ميزان أنزان</h2>';

    echo '<div class="error">';
    echo 'غير مصرح بالوصول إلى صفحة الاختبار.';
    echo '</div>';

    echo '</div>';

    echo '</body>';

    echo '</html>';

    exit;
}


/*
|--------------------------------------------------------------------------
| إعدادات PHP
|--------------------------------------------------------------------------
*/

ini_set(
    'display_errors',
    '1'
);

ini_set(
    'display_startup_errors',
    '1'
);

error_reporting(E_ALL);


/*
|--------------------------------------------------------------------------
| إعدادات الطالب للاختبار
|--------------------------------------------------------------------------
|
| استخدم طالبًا موجودًا فعليًا.
|
|--------------------------------------------------------------------------
*/

$studentId =
    1;


$studentCode =
    'STU123';


/*
|--------------------------------------------------------------------------
| إنشاء عنوان API
|--------------------------------------------------------------------------
*/

$scheme =
    (
        isset($_SERVER['HTTPS']) &&
        $_SERVER['HTTPS'] !== 'off'
    )
        ? 'https'
        : 'http';


$host =
    $_SERVER['HTTP_HOST'] ?? '';


$apiUrl =
    $scheme .
    '://' .
    $host .
    '/mizan_anzan/api/save-result.php';


/*
|--------------------------------------------------------------------------
| بيانات الاختبار
|--------------------------------------------------------------------------
*/

$payload = [

    'student_id' =>
        $studentId,

    'student_code' =>
        $studentCode,

    'student_name' =>
        'اختبار أنزان',

    'correct_answers' =>
        10,

    'total_questions' =>
        10,

    'score' =>
        10,

    'duration_seconds' =>
        60,

    'avg_time_per_question' =>
        6,

    'digits_count' =>
        2,

    'rows_count' =>
        5,

    'speed_ms' =>
        6000,

    'operation_type' =>
        'addition',

    'training_mode' =>
        'test',

    'preset' =>
        'default',

    'country' =>
        'Iraq',

    'age_category' =>
        'adult',

    'anz_id' =>
        'TEST-ANZ-001',

    'session_id' =>
        'TEST-' .
        date('Ymd-His') .
        '-' .
        bin2hex(
            random_bytes(4)
        )

];


/*
|--------------------------------------------------------------------------
| تحويل البيانات إلى JSON
|--------------------------------------------------------------------------
*/

$jsonPayload =
    json_encode(
        $payload,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );


if ($jsonPayload === false) {

    die(
        'فشل إنشاء JSON: ' .
        json_last_error_msg()
    );

}


/*
|--------------------------------------------------------------------------
| التحقق من cURL
|--------------------------------------------------------------------------
*/

if (
    !function_exists('curl_init')
) {

    die(
        'خطأ: امتداد cURL غير مفعّل على الخادم.'
    );

}


/*
|--------------------------------------------------------------------------
| إنشاء cURL
|--------------------------------------------------------------------------
*/

$ch =
    curl_init(
        $apiUrl
    );


curl_setopt_array(
    $ch,
    [

        CURLOPT_POST =>
            true,

        CURLOPT_POSTFIELDS =>
            $jsonPayload,

        CURLOPT_HTTPHEADER =>
            [

                'Content-Type: application/json',

                'Accept: application/json',

            ],

        CURLOPT_RETURNTRANSFER =>
            true,

        CURLOPT_HEADER =>
            false,

        CURLOPT_TIMEOUT =>
            30,

        CURLOPT_CONNECTTIMEOUT =>
            10,

        CURLOPT_FOLLOWLOCATION =>
            true,

        CURLOPT_SSL_VERIFYPEER =>
            true,

        CURLOPT_SSL_VERIFYHOST =>
            2,

    ]
);


/*
|--------------------------------------------------------------------------
| تنفيذ الطلب
|--------------------------------------------------------------------------
*/

$response =
    curl_exec(
        $ch
    );


$curlErrorNumber =
    curl_errno(
        $ch
    );


$curlError =
    curl_error(
        $ch
    );


$httpCode =
    (int)curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );


curl_close(
    $ch
);


/*
|--------------------------------------------------------------------------
| خطأ cURL
|--------------------------------------------------------------------------
*/

if ($response === false) {

    header(
        'Content-Type: text/html; charset=utf-8'
    );

    echo '<pre>';

    echo "فشل الاتصال بالـ API\n\n";

    echo "URL:\n";

    echo htmlspecialchars(
        $apiUrl,
        ENT_QUOTES,
        'UTF-8'
    );

    echo "\n\n";

    echo "cURL Error Number:\n";

    echo $curlErrorNumber;

    echo "\n\n";

    echo "cURL Error:\n";

    echo htmlspecialchars(
        $curlError,
        ENT_QUOTES,
        'UTF-8'
    );

    echo '</pre>';

    exit;
}


/*
|--------------------------------------------------------------------------
| محاولة قراءة JSON
|--------------------------------------------------------------------------
*/

$decodedResponse =
    json_decode(
        $response,
        true
    );


/*
|--------------------------------------------------------------------------
| واجهة الصفحة
|--------------------------------------------------------------------------
*/

header(
    'Content-Type: text/html; charset=utf-8'
);


echo '<!DOCTYPE html>';

echo '<html lang="ar" dir="rtl">';

echo '<head>';

echo '<meta charset="UTF-8">';

echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">';

echo '<title>اختبار حفظ نتيجة تحدي أنزان</title>';


echo '<style>

body {
    font-family: Arial, sans-serif;
    background: #f5f5f5;
    padding: 30px;
}

.container {
    max-width: 900px;
    margin: auto;
    background: #fff;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 5px 25px rgba(0,0,0,.08);
}

h1 {
    margin-top: 0;
}

.status {
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-weight: bold;
}

.success {
    background: #e8f7ed;
    color: #176b35;
}

.error {
    background: #fdecec;
    color: #9b1c1c;
}

pre {
    direction: ltr;
    text-align: left;
    background: #111;
    color: #eee;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

td {
    border: 1px solid #ddd;
    padding: 10px;
}

td:first-child {
    font-weight: bold;
    width: 30%;
}

</style>';


echo '</head>';

echo '<body>';

echo '<div class="container">';


/*
|--------------------------------------------------------------------------
| العنوان
|--------------------------------------------------------------------------
*/

echo '<h1>🧪 اختبار API حفظ نتيجة تحدي أنزان</h1>';


/*
|--------------------------------------------------------------------------
| حالة API
|--------------------------------------------------------------------------
*/

if (
    is_array($decodedResponse) &&
    isset($decodedResponse['success'])
) {

    $success =
        (bool)$decodedResponse['success'];


    if ($success) {

        echo '<div class="status success">';

        echo '✓ تم الاتصال بالـ API وتمت معالجة الطلب بنجاح.';

        echo '</div>';

    } else {

        echo '<div class="status error">';

        echo '✗ وصل الطلب إلى API ولكن عملية الحفظ لم تنجح.';

        echo '</div>';

    }

} else {

    echo '<div class="status error">';

    echo '✗ استجابة API ليست JSON بالشكل المتوقع.';

    echo '</div>';

}


/*
|--------------------------------------------------------------------------
| معلومات HTTP
|--------------------------------------------------------------------------
*/

echo '<table>';


echo '<tr>';

echo '<td>HTTP Status</td>';

echo '<td>';

echo htmlspecialchars(
    (string)$httpCode,
    ENT_QUOTES,
    'UTF-8'
);

echo '</td>';

echo '</tr>';


echo '<tr>';

echo '<td>API URL</td>';

echo '<td>';

echo htmlspecialchars(
    $apiUrl,
    ENT_QUOTES,
    'UTF-8'
);

echo '</td>';

echo '</tr>';


echo '</table>';


/*
|--------------------------------------------------------------------------
| استجابة API
|--------------------------------------------------------------------------
*/

echo '<h2>استجابة API</h2>';

echo '<pre>';


if (
    $decodedResponse !== null
) {

    echo htmlspecialchars(
        json_encode(
            $decodedResponse,
            JSON_PRETTY_PRINT |
            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES
        ),
        ENT_QUOTES,
        'UTF-8'
    );

} else {

    echo htmlspecialchars(
        $response,
        ENT_QUOTES,
        'UTF-8'
    );

}


echo '</pre>';


/*
|--------------------------------------------------------------------------
| البيانات المرسلة
|--------------------------------------------------------------------------
*/

echo '<h2>البيانات المرسلة</h2>';

echo '<pre>';


echo htmlspecialchars(
    json_encode(
        $payload,
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    ),
    ENT_QUOTES,
    'UTF-8'
);


echo '</pre>';


echo '</div>';

echo '</body>';

echo '</html>';