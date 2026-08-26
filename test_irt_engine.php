<?php
// ============================================================
// test_irt_engine.php - اختبارات الوحدة لمحرك IRT (صيغة PHP)
// ============================================================

// 1. دالة تحديث القدرة (المنطق الخالص للـ IRT)
function update_ability($theta, $correct, $difficulty, $discrimination = 1.0, $learning_rate = 0.3) {
    $prob_correct = 1 / (1 + exp(-$discrimination * ($theta - $difficulty)));
    $prediction_error = ($correct ? 1 : 0) - $prob_correct;
    $new_theta = $theta + ($learning_rate * $discrimination * $prediction_error);
    // الحدود الدنيا والعليا للقدرة (-4 إلى 4)
    return max(-4.0, min(4.0, $new_theta));
}

function assert_test($condition, $message) {
    if ($condition) {
        echo "<span style='color:green; font-weight:bold;'>✅ PASS</span>: " . $message . "<br>";
    } else {
        echo "<span style='color:red; font-weight:bold;'>❌ FAIL</span>: " . $message . "<br>";
    }
}

echo "<h2 style='font-family:sans-serif;'>🧪 اختبارات IRT الذكي (نسخة PHP)</h2>";

// ============================================================
// اختبارات الوحدة
// ============================================================

// 1. رفع القدرة عند الإجابة الصحيحة
$theta = 0.0;
$new_theta = update_ability($theta, true, 0.0);
assert_test($new_theta > $theta, "يجب أن تزيد القدرة عند الإجابة الصحيحة");
assert_test($new_theta <= 4.0, "الزيادة يجب ألا تتجاوز الحد الأعلى (4)");

// 2. خفض القدرة عند الإجابة الخاطئة
$theta = 0.0;
$new_theta = update_ability($theta, false, 0.0);
assert_test($new_theta < $theta, "يجب أن تنقص القدرة عند الإجابة الخاطئة");
assert_test($new_theta >= -4.0, "النقصان يجب ألا يقل عن الحد الأدنى (-4)");

// 3. تأثير صعوبة السؤال (Difficulty)
$theta = 0.0;
$update_hard = update_ability($theta, true, 1.5);
$update_easy = update_ability($theta, true, -1.5);
assert_test($update_hard > $update_easy, "السؤال الصعب يجب أن يرفع القدرة أكثر من السؤال السهل");

$wrong_easy = update_ability($theta, false, -1.5);
$wrong_hard = update_ability($theta, false, 1.5);
assert_test($wrong_easy < $wrong_hard, "الخطأ في سؤال سهل يجب أن يخفض القدرة أكثر من سؤال صعب");

// 4. تأثير معامل التمييز (Discrimination)
$theta = 0.0;
$high_disc = update_ability($theta, true, 0.0, 2.0);
$low_disc = update_ability($theta, true, 0.0, 0.5);
assert_test($high_disc > $low_disc, "معامل التمييز العالي يجب أن يسبب تغيراً أكبر في القدرة");

// 5. الحدود الدنيا والعليا للقدرة (Bounds)
$lower_bound = update_ability(-3.5, false, 0.0, 1.0, 1.0);
assert_test($lower_bound >= -4.0, "يجب ألا تقل القدرة عن -4");

$upper_bound = update_ability(3.5, true, 0.0, 1.0, 1.0);
assert_test($upper_bound <= 4.0, "يجب ألا تزيد القدرة عن 4");

// 6. استقرار الخوارزمية مع القيم المتطرفة
$theta = 0.0;
$correct_result = update_ability($theta, true, 0.0, 1.0);
assert_test($correct_result > 0.15 && $correct_result < 0.5, "الزيادة يجب أن تكون قيمة موجبة معقولة (بين 0.15 و 0.5)");

$wrong_result = update_ability($theta, false, 0.0, 1.0);
assert_test($wrong_result < -0.15 && $wrong_result > -0.5, "النقصان يجب أن يكون قيمة سالبة معقولة (بين -0.5 و -0.15)");

echo "<hr><p style='color:gray; font-size:12px;'>✅ تم تشغيل الاختبارات بنجاح. هذا الملف مجرد اختبار برمجي، يمكنك حذفه بعد التأكد من صحة الخوارزمية.</p>";
?>