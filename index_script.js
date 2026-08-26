<!-- أزرار الواجهة الرئيسي -->
<button type="button" id="leaderboardBtn" class="btn-yellow">🏆 الصدارة</button>
<button type="button" id="historyBtn" class="btn-blue">📈 التاريخ</button>

<script>
document.addEventListener('DOMContentLoaded', () => {
    // 1. ربط زر الصدارة بنقل المعايير المحددة تلقائياً
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => {
            const digits   = document.querySelector('[name="digits"]')?.value || document.getElementById('digitsInput')?.value || '';
            const rows     = document.querySelector('[name="rows"]')?.value || document.getElementById('rowsInput')?.value || '';
            const duration = document.querySelector('[name="duration"]')?.value || document.getElementById('durationInput')?.value || '';
            
            // تحويل السرعة من ثوانٍ إلى ملي ثانية (ms)
            const speedSec = parseFloat(document.querySelector('[name="speed"]')?.value || document.getElementById('speedInput')?.value || 1.0);
            const speedMs  = Math.round(speedSec * 1000);

            const params = new URLSearchParams({
                digits_count: digits,
                rows_count: rows,
                duration_seconds: duration,
                speed_ms: speedMs
            });

            window.location.href = `leaderboard.php?${params.toString()}`;
        });
    }

    // 2. ربط زر التاريخ بالتقرير التاريخي للطالب
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            window.location.href = 'student_history.php';
        });
    }
});
</script>