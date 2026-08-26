<?php
require_once 'includes/db.php';

$fileName = 'ICSHD_MATH -.xlsx - الورقة1.csv'; // اسم الملف المرفوع

if (!file_exists($fileName)) {
    die("خطأ: ملف CSV غير موجود في المجلد!");
}

if (($handle = fopen($fileName, "r")) !== FALSE) {
    // تخطي السطر الأول (العناوين)
    fgetcsv($handle); 

    $stmt = $pdo->prepare("INSERT INTO math_standards (rows_count, digits_count, band, age_group, numbers_json, final_result, difficulty_score, rule_labeler) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    $count = 0;
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        // فلترة: نأخذ فقط العمليات التي Logic Audit فيها "سليم" (العمود رقم 32 في ملفك)
        if (!isset($data[32]) || trim($data[32]) !== 'سليم') continue;

        // تحديد الفئة العمرية (بناءً على الأعمدة 3، 4، 5، 6)
        $age = 'general';
        if ($data[3] == '1') $age = 'age_un7';
        elseif ($data[4] == '1') $age = 'age_7_9';
        elseif ($data[5] == '1') $age = 'age_10_12';
        elseif ($data[6] == '1') $age = 'age_up12';

        // تجميع الأرقام (من num1 إلى num18) وتجاهل الخلايا الفارغة أو الأخطاء
        $numbers = [];
        for ($i = 7; $i <= 24; $i++) {
            if (isset($data[$i]) && is_numeric($data[$i])) {
                $numbers[] = (int)$data[$i];
            }
        }

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
    echo "✅ تم بنجاح! تم استيراد ($count) عملية حسابية سليمة إلى الجدول.";
}