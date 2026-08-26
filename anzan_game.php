<?php
// anzan_game.php - النسخة المنقحة لنظام ميزان ماث
require_once __DIR__ . '/includes/db.php';
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ميزان ماث - التدريب الذكي</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Cairo', sans-serif; background-color: #f3f4f6; }
        .number-display { font-size: 12rem; font-weight: 900; min-height: 300px; display: flex; align-items: center; justify-content: center; }
    </style>
</head>
<body class="p-4">
    <div id="app" class="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div id="setup-panel" class="p-8">
            <h1 class="text-3xl font-bold text-center text-indigo-600 mb-8">إعدادات التحدي</h1>
            <div class="space-y-6">
                <div>
                    <label class="block text-gray-700 mb-2">المستوى (Band):</label>
                    <select id="level-select" class="w-full p-3 border rounded-xl bg-gray-50">
                        <option value="L1-Beginner">L1-Beginner</option>
                        <option value="L2-Intermediate">L2-Intermediate</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-700 mb-2">الأرقام (Digits):</label>
                        <select id="digits-select" class="w-full p-3 border rounded-xl">
                            <option value="1">آحاد (1)</option>
                            <option value="2">عشرات (2)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">الصفوف (Rows):</label>
                        <input type="number" id="rows-input" value="3" min="2" max="18" class="w-full p-3 border rounded-xl">
                    </div>
                </div>
                <button onclick="game.start()" class="w-full bg-indigo-600 text-white py-4 rounded-2xl text-xl font-bold hover:bg-indigo-700 transition">ابدأ التحدي</button>
            </div>
        </div>

        <div id="game-panel" class="hidden p-8 text-center">
            <div id="number-screen" class="number-display text-indigo-600">--</div>
            <div id="answer-section" class="hidden mt-8">
                <input type="number" id="user-answer" placeholder="أدخل الناتج" class="text-3xl p-4 border-4 border-indigo-200 rounded-2xl w-full text-center mb-4">
                <button onclick="game.checkAnswer()" class="w-full bg-green-500 text-white py-4 rounded-2xl text-xl font-bold">تأكيد الإجابة</button>
            </div>
        </div>
    </div>

    <script>
        class AnzanGame {
            constructor() {
                this.settings = {};
                this.currentProblem = null;
            }

            async start() {
                this.settings = {
                    level: document.getElementById('level-select').value,
                    digits: document.getElementById('digits-select').value,
                    rows: document.getElementById('rows-input').value,
                    age: 'age_7_9' // القيمة الافتراضية
                };

                document.getElementById('setup-panel').classList.add('hidden');
                document.getElementById('game-panel').classList.remove('hidden');
                
                await this.fetchProblem();
            }

            async fetchProblem() {
                const fd = new FormData();
                fd.append('action', 'get_mizan_problem');
                fd.append('level', this.settings.level);
                fd.append('digits', this.settings.digits);
                fd.append('rows', this.settings.rows);
                fd.append('age', this.settings.age);

                try {
                    const res = await fetch('api_student.php', { method: 'POST', body: fd });
                    const data = await res.json();
                    if (data.status === 'success') {
                        this.currentProblem = data;
                        this.displayNumbers(data.numbers);
                    } else {
                        alert("لم يتم العثور على مسائل تطابق هذه المعايير في القاعدة.");
                        location.reload();
                    }
                } catch (e) { alert("خطأ في الاتصال بالخادم"); }
            }

            async displayNumbers(numbers) {
                const screen = document.getElementById('number-screen');
                for (let num of numbers) {
                    screen.innerText = (num > 0 ? "+" : "") + num;
                    await new Promise(r => setTimeout(r, 1000)); // سرعة العرض (1 ثانية)
                    screen.innerText = "";
                    await new Promise(r => setTimeout(r, 100));
                }
                screen.innerText = "?";
                document.getElementById('answer-section').classList.remove('hidden');
            }

            checkAnswer() {
                const userVal = document.getElementById('user-answer').value;
                if (parseInt(userVal) === this.currentProblem.result) {
                    alert("إجابة صحيحة! القاعدة المستخدمة: " + this.currentProblem.rule);
                } else {
                    alert("للأسف، الإجابة خاطئة. الناتج الصحيح هو: " + this.currentProblem.result);
                }
                location.reload();
            }
        }

        const game = new AnzanGame();
    </script>
</body>
</html>