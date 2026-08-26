<?php
// تفعيل عرض الأخطاء للتأكد من سير العملية
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'includes/db.php';

// اسم الملف كما يظهر في صورتك تماماً
$fileName = 'ICSHD_MATH -.xlsx - الورقة1.csv'; 

if (!file_exists($fileName)) {
    die("❌ خطأ: لم يتم العثور على ملف الـ CSV. تأكد من الاسم: " . $fileName);
}

try {
    if (($handle = fopen($fileName, "r")) !== FALSE) {
        // تخطي سطر العناوين
        fgetcsv($handle); 

        $stmt = $pdo->prepare("INSERT INTO math_standards 
            (rows_count, digits_count, band, age_group, numbers_json, final_result, difficulty_score, rule_labeler) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

        $count = 0;
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            // التحقق من أن السطر يحتوي على بيانات كافية
            if (count($data) < 30) continue;

            // فلترة: نأخذ فقط العمليات التي Logic Audit فيها "سليم" (العمود رقم 32)
            if (trim($data[32]) !== 'سليم') continue;

            // تحديد الفئة العمرية
            $age = 'general';
            if ($data[3] == '1') $age = 'age_un7';
            elseif ($data[4] == '1') $age = 'age_7_9';
            elseif ($data[5] == '1') $age = 'age_10_12';
            elseif ($data[6] == '1') $age = 'age_up12';

            // تجميع الأرقام من num1 إلى num18
            $numbers = [];
            for ($i = 7; $i <= 24; $i++) {
                if (isset($data[$i]) && $data[$i] !== '' && is_numeric($data[$i])) {
                    $numbers[] = (int)$data[$i];
                }
            }

            // تنفيذ الإدخال
            $stmt->execute([
                (int)$data[0], // rows_count
                (int)$data[1], // digits_count
                $data[31],      // Band
                $age,
                json_encode($numbers),
                (int)$data[25], // final_result
                (int)$data[30], // difficulty_score
                $data[33]       // Rule Labeler
            ]);
            $count++;
        }
        fclose($handle);
        echo "<div style='direction:rtl; font-family:Tahoma; padding:20px; border:2px solid green; background:#eaffea;'>";
        echo "<h2>✅ تم بنجاح!</h2>";
        echo "<p>تم استيراد <b>$count</b> عملية حسابية مدققة إلى قاعدة البيانات بنجاح.</p>";
        echo "<p>يمكنك الآن الذهاب إلى phpMyAdmin والضغط على الجدول لتجد البيانات بداخلها.</p>";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "❌ حدث خطأ أثناء الاستيراد: " . $e->getMessage();
}