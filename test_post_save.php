<?php
// test_post_save.php
?>
<form method="post" action="api_student.php" target="_blank">
 <input type="hidden" name="action" value="save_result">
 <input type="hidden" name="student_code" value="STU123"><!-- نفس الكود الموجود في جدول students -->
 <input type="hidden" name="correct_answers" value="10">
 <input type="hidden" name="duration_seconds" value="60">
 <input type="hidden" name="avg_time_per_question" value="6">
 <button type="submit">إرسال نتيجة اختبار</button>
</form>
