<?php require_once __DIR__ . '/includes/db.php'; ?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ميزان ماس - نظام الأنزان العالمي (منقح)</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root { --primary-blue: #1a3a5f; --success-green: #27ae60; --mizan-gold: #d4af37; --bg-light: #f4f7f6; }
        body { background-color: var(--bg-light); font-family: 'Cairo', sans-serif; margin: 0; display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding-bottom: 50px;}
        
        /* أداة الفحص البصري (Test Tool) */
        .test-tool-bar { width: 100%; background: white; padding: 10px; border-bottom: 2px solid #ddd; text-align: center; }
        .test-btn { padding: 8px 15px; background: var(--primary-blue); color: white; border: none; border-radius: 5px; cursor: pointer; margin: 0 10px; }
        .test-status { display: inline-block; width: 15px; height: 15px; border-radius: 50%; background: #ccc; vertical-align: middle; margin: 0 5px; }
        .status-red { background: #e74c3c; animation: pulse 1s infinite; }
        .status-green { background: var(--success-green); }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        /* تنسيق الواجهة */
        .status-bar { width: 100%; max-width: 800px; background: var(--primary-blue); color: white; padding: 15px; display: flex; justify-content: space-between; border-radius: 0 0 20px 20px; border-bottom: 4px solid var(--mizan-gold); box-shadow: 0 4px 10px rgba(0,0,0,0.2); box-sizing: border-box; }
        .flash-card-monitor { width: 350px; height: 250px; margin: 40px auto; background: #ffffff; border: 8px solid var(--mizan-gold); border-radius: 30px; display: flex; align-items: center; justify-content: center; font-size: 130px; font-weight: 900; color: var(--primary-blue); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .controls { text-align: center; background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); width: 90%; max-width: 400px; }
        .mizan-input { font-size: 32px; width: 100%; max-width: 200px; text-align: center; padding: 10px; border: 3px solid var(--primary-blue); border-radius: 15px; margin-bottom: 20px; outline: none; }
        .btn-mizan { background-color: var(--success-green); color: white; border: none; padding: 15px 40px; border-radius: 50px; font-size: 20px; font-weight: bold; cursor: pointer; transition: 0.3s all; box-shadow: 0 5px 0 #1e8449; margin: 5px; }
        .btn-mizan:active { transform: translateY(4px); box-shadow: none; }
        #toast { position: fixed; top: 120px; background: var(--primary-blue); color: white; padding: 12px 25px; border-radius: 10px; display: none; z-index: 1000; font-weight: bold; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
    </style>
</head>
<body>

<div class="test-tool-bar">
    <span style="font-weight:bold; color:var(--primary-blue)">أداة فحص النظام:</span>
    <button class="test-btn" onclick="runDiagnostic()">افحص الآن</button>
    | ملف الـ API: <span id="api-status-dot" class="test-status"></span>
    | قاعدة البيانات: <span id="db-status-dot" class="test-status"></span>
</div>

<div id="toast"></div>

<div class="status-bar">
    <div>السرعة: <span id="speed-val">1.0</span> ث</div>
    <div style="font-weight: 900;">MIZAN MATH (منقح)</div>
    <div>المستوى: <span id="level-val">Simple</span></div>
</div>

<div class="flash-card-monitor" id="display">جاهز؟</div>

<div class="controls">
    <input type="number" id="answer-input" class="mizan-input" placeholder="الناتج">
    <br>
    <button class="btn-mizan" id="start-btn" onclick="fetchNewProblem()">ابدأ التحدي</button>
</div>

<script>
    const state = { speed: 1.0, currentAnswer: null, isBusy: false, studentCode: 'STU123' };

    // --- أداة الفحص البصري (Diagnostic Tool) ---
    async function runDiagnostic() {
        const apiDot = document.getElementById('api-status-dot');
        const dbDot = document.getElementById('db-status-dot');
        
        apiDot.className = 'test-status status-red'; // نبدأ بالأحمر (جاري الفحص)
        dbDot.className = 'test-status status-red';

        try {
            // 1. فحص الاتصال بملف API
            const response = await fetch('api_student.php', { method: 'POST', body: new URLSearchParams({'action': 'diagnostic'}) });
            
            if (response.ok) {
                apiDot.className = 'test-status status-green';
                showToast("اتصال API سليم ✔️");
            } else {
                throw new Error("API Not Responding");
            }

            // 2. فحص قاعدة البيانات (طلب مسألة تجريبية)
            const dbResponse = await fetch('api_student.php', { method: 'POST', body: new URLSearchParams({'action': 'get_mizan_problem', 'level': 'الاول', 'digits': 1, 'rows': 3, 'age': 'age_7_9'}) });
            const data = await dbResponse.json();

            if (data.status === 'success') {
                dbDot.className = 'test-status status-green';
                showToast("قاعدة البيانات تحتوي على مسائل ✔️");
            } else {
                showToast("خطأ في البيانات: " + (data.debug || data.message));
            }
        } catch (e) {
            showToast("فشل الفحص: " + e.message);
        }
    }

    // --- محرك الأنزان (منقح) ---
    function playTick() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    }

    async function fetchNewProblem() {
        if (state.isBusy) return;
        state.isBusy = true;
        const display = document.getElementById('display');
        display.innerText = "...";

        try {
            // نستخدم FormData لضمان وصول البيانات لـ PHP كـ POST
            const formData = new FormData();
            formData.append('action', 'get_mizan_problem');
            formData.append('level', 'الاول');
            formData.append('digits', 1);
            formData.append('rows', 3);
            formData.append('age', 'age_7_9');

            const res = await fetch('api_student.php', { method: 'POST', body: formData });
            const data = await res.json();
            
            if (data.status === 'success') {
                state.currentAnswer = data.result;
                runFlashDisplay(data.numbers);
            } else {
                display.innerText = "خطأ";
                showToast("الخطأ: " + (data.debug || data.message));
            }
        } catch (e) { display.innerText = "فشل"; showToast("فشل الاتصال"); }
        state.isBusy = false;
    }

    async function runFlashDisplay(numbers) {
        document.getElementById('answer-input').value = "";
        const display = document.getElementById('display');

        for (let num of numbers) {
            display.innerText = (num > 0) ? `+${num}` : num;
            playTick();
            await new Promise(r => setTimeout(r, state.speed * 1000));
            display.innerText = "";
            await new Promise(r => setTimeout(r, 100));
        }
        display.innerText = "؟";
        document.getElementById('answer-input').focus();
    }

    function showToast(msg) {
        const t = document.getElementById('toast');
        t.innerText = msg; t.style.display = 'block';
        setTimeout(() => t.style.display = 'none', 3000);
    }
</script>
</body>
</html>