// الحالة العامة للتطبيق
const AppState = {
    student: null,
    config: {
        mode: 'flash',
        level: 'L1',
        ageGroup: '7_9',
        digits: 2,
        rows: 4,
        operation: 'mixed',
        duration: 60,
        restTime: 2,
        speed: 0.8,
        useTTS: false,
        allowNegative: false
    },
    game: {
        active: false,
        score: 0,
        totalAttempted: 0,
        totalCorrect: 0,
        numbers: [],
        correctResult: 0n,
        engineSequence: null,
        timer: null,
        timeLeft: 0,
        focusScore: 96,
        growthScore: 91
    },
    lang: 'ar'
};

// تطبيق الإعدادات المسبقة
function applyStandardPreset(presetKey) {
    if (presetKey === 'custom') return;

    const presetConfigs = {
        kyu_beginner: { digits: 2, rows: 4, speed: 1.2, level: 'L1', operation: 'mixed' },
        kyu_inter: { digits: 3, rows: 6, speed: 0.8, level: 'L2', operation: 'mixed' },
        kyu_advanced: { digits: 4, rows: 10, speed: 0.5, level: 'L3', operation: 'mixed' },
        dan_pro: { digits: 6, rows: 20, speed: 0.3, level: 'LM', operation: 'mixed' },
        dan_master: { digits: 9, rows: 35, speed: 0.2, level: 'LM', operation: 'mixed' },
        olympiad_gm: { digits: 12, rows: 60, speed: 0.1, level: 'LM', operation: 'mixed' }
    };

    const target = presetConfigs[presetKey];
    if (target) {
        document.getElementById('digits').value = target.digits;
        document.getElementById('rows').value = target.rows;
        document.getElementById('speed').value = target.speed;
        document.getElementById('level-type').value = target.level;
        document.getElementById('operation-type').value = target.operation;
        updateSpeedDisplay(target.speed);
    }
}

function updateSpeedDisplay(val) {
    document.getElementById('speed-value').textContent = `${parseFloat(val).toFixed(2)} sec`;
}

document.addEventListener('DOMContentLoaded', () => {
    checkStudentOnboarding();
    loadLeaderboardMockData();

    // الاستماع لزر Enter في خانة الإجابة
    const answerInput = document.getElementById('user-answer');
    if (answerInput) {
        answerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                GameEngine.submitAnswer();
            }
        });
    }
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const isRTL = AppState.lang === 'ar';
    const closedClass = isRTL ? 'sidebar-closed-rtl' : 'sidebar-closed-ltr';
    
    sidebar.classList.toggle(closedClass);
    overlay.classList.toggle('hidden');
}

function switchView(panelId) {
    document.getElementById('setup-panel').classList.add('hidden');
    document.getElementById('game-panel').classList.add('hidden');
    document.getElementById(panelId).classList.remove('hidden');
}

function openRegistrationModal() {
    document.getElementById('onboarding-modal').classList.remove('hidden');
}

function checkStudentOnboarding() {
    const saved = localStorage.getItem('anzan_student_profile');
    if (saved) {
        AppState.student = JSON.parse(saved);
        updateStudentUI();
    } else {
        openRegistrationModal();
    }
}

function registerFirstTimeStudent() {
    const fullName = document.getElementById('reg-fullname').value.trim();
    const country = document.getElementById('reg-country').value.trim();
    if (!fullName || !country) return;

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const code = `ANZ-${randomNum}`;

    AppState.student = { code, fullName, country };
    localStorage.setItem('anzan_student_profile', JSON.stringify(AppState.student));
    
    document.getElementById('onboarding-modal').classList.add('hidden');
    updateStudentUI();
}

function updateStudentUI() {
    if (!AppState.student) return;
    document.getElementById('side-student-code').textContent = AppState.student.code;
    document.getElementById('side-student-info').textContent = `${AppState.student.fullName} (${AppState.student.country})`;
}

// محرك اللعبة
const GameEngine = {
    initGameSequence() {
        AppState.config.mode = document.querySelector('input[name="training_mode"]:checked').value;
        AppState.config.level = document.getElementById('level-type').value;
        AppState.config.ageGroup = document.getElementById('age-group').value;
        AppState.config.digits = parseInt(document.getElementById('digits').value);
        AppState.config.rows = parseInt(document.getElementById('rows').value);
        AppState.config.operation = document.getElementById('operation-type').value;
        AppState.config.duration = parseInt(document.getElementById('challenge-time').value);
        AppState.config.restTime = parseInt(document.getElementById('rest-time').value);
        AppState.config.speed = parseFloat(document.getElementById('speed').value);
        AppState.config.useTTS = document.getElementById('enable-tts').checked;
        AppState.config.allowNegative = document.getElementById('allow-negative').checked;

        AppState.game.score = 0;
        AppState.game.totalAttempted = 0;
        AppState.game.totalCorrect = 0;
        AppState.game.active = true;
        AppState.game.timeLeft = AppState.config.duration;

        document.getElementById('game-score').textContent = '0';
        document.getElementById('game-timer').textContent = AppState.game.timeLeft;
        
        switchView('game-panel');
        
        this.runCountdownSequence(() => {
            this.startMainTimer();
            this.nextQuestion();
        });
    },

    runCountdownSequence(onComplete) {
        const display = document.getElementById('flash-display');
        const sorobanDisp = document.getElementById('soroban-display');
        sorobanDisp.classList.add('hidden');
        display.classList.remove('hidden');

        const steps = AppState.lang === 'ar' ? ['3', '2', '1', 'إبدأ!'] : ['3', '2', '1', 'START!'];
        let idx = 0;

        const interval = setInterval(() => {
            if (idx < steps.length) {
                display.innerHTML = `<span class="text-yellow-400 animate-ping font-black">${steps[idx]}</span>`;
                idx++;
            } else {
                clearInterval(interval);
                onComplete();
            }
        }, 800);
    },

    startMainTimer() {
        if (AppState.game.timer) clearInterval(AppState.game.timer);
        AppState.game.timer = setInterval(() => {
            AppState.game.timeLeft--;
            document.getElementById('game-timer').textContent = AppState.game.timeLeft;

            if (AppState.game.timeLeft <= 0) {
                clearInterval(AppState.game.timer);
                this.finishGame();
            }
        }, 1000);
    },

    generateNumbers() {

        const { digits, rows, operation, allowNegative, level } = AppState.config;

        /* UI levels -> canonical Soroban Engine levels. */
        const levelMap = Object.freeze({
            L1: MizanAnzanSoroban.LEVELS.SIMPLE,
            L2: MizanAnzanSoroban.LEVELS.F5,
            L3: MizanAnzanSoroban.LEVELS.F10,
            LM: MizanAnzanSoroban.LEVELS.MIX
        });

        const engineLevel = levelMap[level];

        if (!engineLevel) {
            throw new Error(`Unsupported Mizan Anzan level: ${level}`);
        }

        /*
         * Engine v3 intentionally keeps negative-state support OFF.
         * The UI checkbox is therefore treated as a guarded configuration
         * rather than silently producing a challenge with different rules.
         */
        if (allowNegative !== false) {
            throw new Error(
                'Negative results are not supported by the current Soroban engine.'
            );
        }

        const sequence = MizanAnzanSoroban.generateSequence({
            digits,
            rows,
            operation,
            level: engineLevel,
            allowNegative: false,
            maxGenerationAttempts: 300,
            candidatesPerRow: 40
        });

        AppState.game.engineSequence = sequence;
        AppState.game.numbers = sequence.terms.map((term, index) => {
            const value = BigInt(term);
            return {
                val: value < 0n ? -value : value,
                op: index === 0 ? '+' : (value < 0n ? '-' : '+')
            };
        });

        AppState.game.correctResult = BigInt(sequence.answer);

        return sequence;
    },

    speakNumber(text) {
        if (!AppState.config.useTTS || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel(); // إلغاء أي طابور صوتي سابق فوراً
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = AppState.lang === 'ar' ? 'ar-SA' : 'en-US';
        utterance.rate = 1.3;
        window.speechSynthesis.speak(utterance);
    },

    async nextQuestion() {
        document.getElementById('answer-box').classList.add('hidden');
        document.getElementById('result-feedback').classList.add('hidden');
        
        try {
            this.generateNumbers();
        } catch (error) {
            console.error('[MIZAN ANZAN] Challenge generation failed:', error);
            const display = document.getElementById('flash-display');
            display.classList.remove('hidden');
            display.innerHTML = `<span class="text-red-400 font-bold">${AppState.lang === 'ar' ? 'تعذر توليد تحدٍ صالح بهذه الإعدادات.' : 'Unable to generate a valid challenge with these settings.'}</span>`;
            return;
        }

        if (AppState.config.mode === 'flash') {
            const display = document.getElementById('flash-display');
            const sorobanDisp = document.getElementById('soroban-display');
            sorobanDisp.classList.add('hidden');
            display.classList.remove('hidden');

            const speedMs = AppState.config.speed * 1000;

            for (let i = 0; i < AppState.game.numbers.length; i++) {
                const item = AppState.game.numbers[i];
                const signStr = item.op === '-' ? '<span class="text-red-400 font-bold ml-2">-</span>' : (i > 0 ? '<span class="text-green-400 font-bold ml-2">+</span>' : '');

                display.innerHTML = `${signStr}${item.val}`;
                this.speakNumber(`${item.op === '-' ? 'طرح' : ''} ${item.val}`);

                display.classList.remove('flash-anim');
                void display.offsetWidth;
                display.classList.add('flash-anim');

                await new Promise(r => setTimeout(r, speedMs));
                display.innerHTML = '';
                await new Promise(r => setTimeout(r, 60));
            }

            display.innerHTML = '<span class="text-yellow-400 font-black">؟</span>';
        } else {
            const display = document.getElementById('flash-display');
            const sorobanDisp = document.getElementById('soroban-display');
            display.classList.add('hidden');
            sorobanDisp.classList.remove('hidden');

            sorobanDisp.innerHTML = AppState.game.numbers.map((item, i) => {
                const sign = item.op === '-' ? '-' : (i > 0 ? '+' : '');
                return `<div class="font-mono text-2xl font-bold">${sign} ${item.val}</div>`;
            }).join('<div class="border-b border-white/10 w-32 mx-auto my-1"></div>');
        }

        document.getElementById('answer-box').classList.remove('hidden');
        const input = document.getElementById('user-answer');
        input.value = '';
        input.focus();
    },

    submitAnswer() {
        const inputEl = document.getElementById('user-answer');
        if (!inputEl.value.trim()) return;

        let userVal;

        try {
            const normalized = inputEl.value
                .trim()
                .replace(/[٬,\s]/g, '');

            if (!/^-?\d+$/.test(normalized)) {
                throw new Error('invalid_integer');
            }

            userVal = BigInt(normalized);
        } catch (error) {
            const feedback = document.getElementById('result-feedback');
            feedback.className = "text-center p-4 rounded-xl font-bold text-lg bg-red-500/20 text-red-300 border border-red-500/30";
            feedback.textContent = AppState.lang === 'ar'
                ? 'يرجى إدخال عدد صحيح صالح.'
                : 'Please enter a valid integer.';
            feedback.classList.remove('hidden');
            return;
        }

        const feedback = document.getElementById('result-feedback');
        AppState.game.totalAttempted++;

        const isCorrect = userVal === AppState.game.correctResult;

        if (isCorrect) {
            AppState.game.score += 10;
            AppState.game.totalCorrect++;
            document.getElementById('game-score').textContent = AppState.game.score;

            feedback.className = "text-center p-4 rounded-xl font-bold text-lg bg-green-500/20 text-green-300 border border-green-500/30";
            feedback.textContent = AppState.lang === 'ar' ? "إجابة صحيحة! أحسنت يا عبقري" : "Correct Answer! Great Job!";
        } else {
            feedback.className = "text-center p-4 rounded-xl font-bold text-lg bg-red-500/20 text-red-300 border border-red-500/30";
            feedback.textContent = AppState.lang === 'ar' ? `إجابة خاطئة. الإجابة الصحيحة هي: ${AppState.game.correctResult}` : `Incorrect. Correct answer was: ${AppState.game.correctResult}`;
        }

        feedback.classList.remove('hidden');
        document.getElementById('answer-box').classList.add('hidden');

        const restMs = AppState.config.restTime * 1000;
        setTimeout(() => {
            if (AppState.game.active && AppState.game.timeLeft > 0) {
                this.nextQuestion();
            }
        }, restMs);
    },

    stop() {
        AppState.game.active = false;
        if (AppState.game.timer) clearInterval(AppState.game.timer);
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        switchView('setup-panel');
    },

    finishGame() {
        AppState.game.active = false;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        saveResultToLeaderboard();
        alert(AppState.lang === 'ar' ? `انتهى التحدي!\nنقاطك الإجمالية: ${AppState.game.score}\nعدد الإجابات الصحيحة: ${AppState.game.totalCorrect} من ${AppState.game.totalAttempted}` : `Challenge Complete!\nTotal Score: ${AppState.game.score}\nCorrect: ${AppState.game.totalCorrect} of ${AppState.game.totalAttempted}`);
        switchView('setup-panel');
    }
};

// لوحة الصدارة البيانات التفاعلية
let mockLeaderboard = [];
let currentLeaderboardSort = { key: 'points', direction: 'desc' };

function loadLeaderboardMockData() {
    mockLeaderboard = [
        { code: 'ANZ-982143', country: 'فرنسا', name: 'أحمد علي', mode: 'أنزان ومضي', age: '7_9', level: 'LM', digits: 3, rows: 6, op: 'mixed', duration: 60, speed: 0.5, points: 180 },
        { code: 'ANZ-554129', country: 'مصر', name: 'سارة محمود', mode: 'أنزان ومضي', age: '10_12', level: 'L3', digits: 4, rows: 8, op: 'mixed', duration: 60, speed: 0.4, points: 160 },
        { code: 'ANZ-112094', country: 'السعودية', name: 'عمر التميمي', mode: 'سوروبان عادي', age: '7_9', level: 'L1', digits: 2, rows: 10, op: 'addition', duration: 60, speed: 0.8, points: 140 },
        { code: 'ANZ-883012', country: 'الإمارات', name: 'مريم الكعبي', mode: 'أنزان ومضي', age: '13_15', level: 'L2', digits: 4, rows: 10, op: 'mixed', duration: 60, speed: 0.3, points: 130 }
    ];
}

function saveResultToLeaderboard() {
    if (!AppState.student) return;
    mockLeaderboard.push({
        code: AppState.student.code,
        country: AppState.student.country,
        name: AppState.student.fullName,
        mode: AppState.config.mode === 'flash' ? 'أنزان ومضي' : 'سوروبان عادي',
        age: AppState.config.ageGroup,
        level: AppState.config.level,
        digits: AppState.config.digits,
        rows: AppState.config.rows,
        op: AppState.config.operation,
        duration: AppState.config.duration,
        speed: AppState.config.speed,
        points: AppState.game.score
    });
}

function sortLeaderboard(key) {
    if (currentLeaderboardSort.key === key) {
        currentLeaderboardSort.direction = currentLeaderboardSort.direction === 'desc' ? 'asc' : 'desc';
    } else {
        currentLeaderboardSort.key = key;
        currentLeaderboardSort.direction = (key === 'speed') ? 'asc' : 'desc';
    }
    DashboardManager.openLeaderboard();
}

// مدير اللوحات الإدارية
const DashboardManager = {
    closeModal() {
        document.getElementById('modal-container').classList.add('hidden');
    },

    openLeaderboard() {
        const modal = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');
        
        const { key, direction } = currentLeaderboardSort;
        const mult = direction === 'asc' ? 1 : -1;

        mockLeaderboard.sort((a, b) => {
            let valA = a[key];
            let valB = b[key];
            if (typeof valA === 'number' && typeof valB === 'number') {
                return (valA - valB) * mult;
            }
            return String(valA).localeCompare(String(valB), AppState.lang, { numeric: true }) * mult;
        });

        const top20 = mockLeaderboard.slice(0, 20);

        content.innerHTML = `
            <div class="space-y-6">
                <div class="text-center border-b border-white/10 pb-4">
                    <h2 class="text-2xl font-black text-yellow-400"><i class="fas fa-trophy ml-2"></i>لوحة الصدارة (أعلى 20 عبقري)</h2>
                    <p class="text-xs text-gray-400">اضغط على رأس أي عمود للفرز التفاعلي المباشر</p>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-xs text-right border-collapse">
                        <thead>
                            <tr class="bg-black/50 text-yellow-400 border-b border-yellow-500/20 cursor-pointer">
                                <th class="p-3">#</th>
                                <th onclick="sortLeaderboard('code')" class="p-3">الكود ↕</th>
                                <th onclick="sortLeaderboard('country')" class="p-3">الدولة ↕</th>
                                <th onclick="sortLeaderboard('name')" class="p-3">اسم العبقري/ـة ↕</th>
                                <th onclick="sortLeaderboard('mode')" class="p-3">النمط ↕</th>
                                <th onclick="sortLeaderboard('age')" class="p-3">الفئة ↕</th>
                                <th onclick="sortLeaderboard('level')" class="p-3">المستوى ↕</th>
                                <th onclick="sortLeaderboard('digits')" class="p-3">الخانات ↕</th>
                                <th onclick="sortLeaderboard('rows')" class="p-3">الصفوف ↕</th>
                                <th onclick="sortLeaderboard('op')" class="p-3">العملية ↕</th>
                                <th onclick="sortLeaderboard('duration')" class="p-3">المدة ↕</th>
                                <th onclick="sortLeaderboard('speed')" class="p-3">السرعة ↕</th>
                                <th onclick="sortLeaderboard('points')" class="p-3 text-green-400">النقاط ↕</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${top20.map((item, idx) => `
                                <tr class="border-b border-white/5 hover:bg-yellow-500/5 ${idx < 3 ? 'font-bold text-yellow-300' : 'text-gray-300'}">
                                    <td class="p-3 font-bold text-gray-400">${idx + 1}</td>
                                    <td class="p-3 font-mono text-yellow-400">${item.code}</td>
                                    <td class="p-3">${item.country}</td>
                                    <td class="p-3 font-bold">${item.name}</td>
                                    <td class="p-3">${item.mode}</td>
                                    <td class="p-3">${item.age}</td>
                                    <td class="p-3 font-mono">${item.level}</td>
                                    <td class="p-3">${item.digits}</td>
                                    <td class="p-3">${item.rows}</td>
                                    <td class="p-3">${item.op}</td>
                                    <td class="p-3">${item.duration}s</td>
                                    <td class="p-3 font-mono text-blue-300">${item.speed}s</td>
                                    <td class="p-3 font-mono font-bold text-green-400">${item.points}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
    },

    openTrainerPortal() {
        this.renderAccessDashboard('trainer');
    },

    openParentPortal() {
        this.renderAccessDashboard('parent');
    },

    renderAccessDashboard(role) {
        const modal = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');
        const isTrainer = role === 'trainer';

        const title = isTrainer ? "لوحة التحكم للمدرب" : "لوحة متابعة ولي الأمر";
        const icon = isTrainer ? "fa-user-ninja text-purple-400" : "fa-user-shield text-emerald-400";

        content.innerHTML = `
            <div class="space-y-6">
                <div class="text-center border-b border-white/10 pb-4">
                    <h2 class="text-2xl font-black text-yellow-400"><i class="fas ${icon} ml-2"></i>${title}</h2>
                    <p class="text-xs text-gray-400">أدخل كود العبقري لمتابعة التطور والتحليل الدقيق</p>
                </div>

                <div class="flex gap-2 max-w-md mx-auto">
                    <input type="text" id="lookup-code" placeholder="أدخل كود العبقري (مثال: ANZ-982143)" class="input-field w-full text-center font-mono uppercase">
                    <button onclick="DashboardManager.fetchMetrics('${role}')" class="btn-gold px-6 py-2 rounded-xl font-bold text-sm">متابعة</button>
                </div>

                <div id="metrics-view"></div>
            </div>
        `;
        modal.classList.remove('hidden');
    },

    fetchMetrics(role) {
        const codeInput = document.getElementById('lookup-code').value.trim().toUpperCase();
        const container = document.getElementById('metrics-view');

        if (!codeInput) {
            alert("يرجى إدخال كود العبقري");
            return;
        }

        const accuracy = AppState.game.totalAttempted > 0 ? Math.round((AppState.game.totalCorrect / AppState.game.totalAttempted) * 100) : 94;
        const focus = AppState.game.focusScore;
        const perf = AppState.config.speed + 's';
        const growth = AppState.game.growthScore + '%';

        container.innerHTML = `
            <div class="space-y-6 mt-6 pt-6 border-t border-white/10">
                <div class="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                    <div>
                        <span class="text-xs text-gray-400">العبقري المتابع:</span>
                        <div class="text-lg font-bold text-yellow-300">${AppState.student ? AppState.student.fullName : 'عبقري أنزان'} (${codeInput})</div>
                    </div>
                    <div class="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">حساب نشط ومسجل</div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-black/40 p-4 rounded-xl border border-yellow-500/20 text-center space-y-1">
                        <i class="fas fa-brain text-yellow-400 text-xl"></i>
                        <div class="text-xs text-gray-400 font-bold" data-i18n="focus_metric">التركيز</div>
                        <div class="text-2xl font-black text-yellow-300 font-mono">${focus}%</div>
                    </div>

                    <div class="bg-black/40 p-4 rounded-xl border border-yellow-500/20 text-center space-y-1">
                        <i class="fas fa-bullseye text-green-400 text-xl"></i>
                        <div class="text-xs text-gray-400 font-bold" data-i18n="accuracy_metric">الدقة</div>
                        <div class="text-2xl font-black text-green-400 font-mono">${accuracy}%</div>
                    </div>

                    <div class="bg-black/40 p-4 rounded-xl border border-yellow-500/20 text-center space-y-1">
                        <i class="fas fa-tachometer-alt text-blue-400 text-xl"></i>
                        <div class="text-xs text-gray-400 font-bold" data-i18n="perf_metric">الأداء والسرعة</div>
                        <div class="text-2xl font-black text-blue-300 font-mono">${perf}</div>
                    </div>

                    <div class="bg-black/40 p-4 rounded-xl border border-yellow-500/20 text-center space-y-1">
                        <i class="fas fa-chart-line text-purple-400 text-xl"></i>
                        <div class="text-xs text-gray-400 font-bold" data-i18n="growth_metric">التطور</div>
                        <div class="text-2xl font-black text-purple-300 font-mono">${growth}</div>
                    </div>
                </div>
            </div>
        `;
    }
};