// الحالة العامة للتطبيق
const AppState = {
    student: null,
    config: {
        mode: 'flash', level: 'L1', ageGroup: '7_9', digits: 2, rows: 4,
        operation: 'mixed', duration: 60, restTime: 2, speed: 0.8, useTTS: false
    },
    game: {
        active: false, score: 0, totalAttempted: 0, totalCorrect: 0, lastResultId: null,
        numbers: [], correctResult: 0n, engineSequence: null, timer: null, countdownTimer: null,
        timeLeft: 0, focusScore: 96, growthScore: 91, saveInProgress: false, pendingSaveKey: null
    },
    lang: 'ar'
};

function translateText(key, fallback = key) {
    return typeof window.t === 'function' ? window.t(key, fallback) : fallback;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#039;');
}

function getActiveLanguage() {
    const i18nLang = typeof window.I18n?.currentLang === 'function' ? String(window.I18n.currentLang() || '').toLowerCase() : '';
    if (window.MizanI18n?.meta?.[i18nLang]) return i18nLang;
    const appLang = String(AppState.lang || '').toLowerCase();
    if (window.MizanI18n?.meta?.[appLang]) return appLang;
    const htmlLang = String(document.documentElement.lang || '').toLowerCase();
    if (window.MizanI18n?.meta?.[htmlLang]) return htmlLang;
    return 'ar';
}

function getCurrentLocaleMeta() {
    return window.MizanI18n?.meta?.[AppState.lang] || { dir: AppState.lang === 'ar' ? 'rtl' : 'ltr' };
}

function repositionSidebar(forceState = null) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const lang = getActiveLanguage();
    const isRTL = lang === 'ar';
    if (forceState === true || forceState === false) sidebar.dataset.open = forceState ? 'true' : 'false';
    const open = sidebar.dataset.open === 'true';
    sidebar.classList.remove('right-0', 'left-0', 'border-l', 'border-r', 'sidebar-closed-rtl', 'sidebar-open-rtl', 'sidebar-closed-ltr', 'sidebar-open-ltr');
    sidebar.classList.add(isRTL ? 'right-0' : 'left-0');
    sidebar.classList.add(isRTL ? 'border-l' : 'border-r');
    sidebar.classList.add(open ? (isRTL ? 'sidebar-open-rtl' : 'sidebar-open-ltr') : (isRTL ? 'sidebar-closed-rtl' : 'sidebar-closed-ltr'));
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.classList.toggle('hidden', !open);
}

function refreshDynamicTranslations() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) repositionSidebar();
    const answerInput = document.getElementById('user-answer');
    if (answerInput) {
        answerInput.setAttribute('placeholder', translateText('answer_placeholder'));
        answerInput.dir = AppState.lang === 'ar' ? 'rtl' : 'ltr';
    }
    if (window.DashboardManager?.currentView === 'leaderboard') window.DashboardManager.openLeaderboard();
    else if (typeof window.DashboardManager?.currentView === 'string' && window.DashboardManager.currentView.startsWith('portal:')) window.DashboardManager.renderAccessDashboard(window.DashboardManager.currentView.slice(7));
}

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

function updateChallengeTimerUI() {
    const timerEl = document.getElementById('game-timer');
    const barEl = document.getElementById('challenge-time-bar');
    const timerWrap = document.getElementById('challenge-timer-wrap');
    if (!timerEl) return;
    const duration = Math.max(1, Number(AppState.config.duration) || 1);
    const timeLeft = Math.max(0, Number(AppState.game.timeLeft) || 0);
    const percentage = Math.max(0, Math.min(100, (timeLeft / duration) * 100));
    const danger = timeLeft <= 10;
    timerEl.textContent = String(timeLeft);
    timerEl.classList.toggle('text-red-400', danger);
    timerEl.classList.toggle('text-yellow-300', !danger);
    if (timerWrap) { timerWrap.classList.toggle('text-red-300', danger); timerWrap.classList.toggle('text-yellow-100', !danger); }
    if (barEl) {
        const progressEl = barEl.parentElement;
        if (progressEl) { progressEl.setAttribute('aria-valuemax', String(duration)); progressEl.setAttribute('aria-valuenow', String(timeLeft)); }
        barEl.style.width = `${percentage}%`;
        barEl.style.background = danger ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#f4d35e,#d4af37)';
        barEl.style.boxShadow = danger ? '0 0 14px rgba(239,68,68,.55)' : '0 0 12px rgba(212,175,55,.22)';
    }
}

function getCountdownVisualText(step) { return step === 'start' ? translateText('countdown_start', 'ابدأ!') : String(step); }
function countdownSpeechText(step) {
    const keyMap = { '3': 'countdown_3', '2': 'countdown_2', '1': 'countdown_1', start: 'countdown_start' };
    const key = keyMap[step];
    return key ? translateText(key, step) : String(step);
}
function getCountdownSpeechLocale() {
    try { if (typeof window.I18n?.getSpeechLocale === 'function') return window.I18n.getSpeechLocale(); } catch (_) {}
    const lang = getActiveLanguage();
    return window.MizanI18n?.meta?.[lang]?.speech || `${lang}-` + (lang === 'ar' ? 'SA' : 'US');
}
function primeSpeechEngine() {
    if (!('speechSynthesis' in window)) return;
    try { window.speechSynthesis.getVoices(); window.speechSynthesis.cancel(); window.speechSynthesis.resume(); } catch (_) {}
}
function getPreferredSpeechVoice(lang) {
    if (!('speechSynthesis' in window)) return null;
    const requested = String(lang || '').toLowerCase();
    const prefix = requested.split('-')[0];
    const voices = window.speechSynthesis.getVoices() || [];
    return (voices.find(v => String(v.lang || '').toLowerCase() === requested) || voices.find(v => String(v.lang || '').toLowerCase().startsWith(prefix + '-')) || voices.find(v => String(v.lang || '').toLowerCase() === prefix) || null);
}
function waitForSpeechVoices(timeoutMs = 1200) {
    if (!('speechSynthesis' in window)) return Promise.resolve([]);
    const existing = window.speechSynthesis.getVoices() || [];
    if (existing.length) return Promise.resolve(existing);
    return new Promise(resolve => {
        let done = false;
        const finish = () => {
            if (done) return;
            done = true; clearTimeout(timer);
            try { window.speechSynthesis.removeEventListener('voiceschanged', finish); } catch (_) {}
            resolve(window.speechSynthesis.getVoices() || []);
        };
        const timer = setTimeout(finish, timeoutMs);
        window.speechSynthesis.addEventListener('voiceschanged', finish);
    });
}
async function prepareSpeechForCurrentLanguage() { if (!('speechSynthesis' in window)) return []; return waitForSpeechVoices(); }
function ensureCountdownAudioContext() {
    if (!window.AudioContext && !window.webkitAudioContext) return null;
    try {
        if (!window.__mizanCountdownAudioContext) { const Ctx = window.AudioContext || window.webkitAudioContext; window.__mizanCountdownAudioContext = new Ctx(); }
        const ctx = window.__mizanCountdownAudioContext;
        if (ctx.state === 'suspended') void ctx.resume();
        return ctx;
    } catch (_) { return null; }
}
function playCountdownFallbackTone(step) {
    const ctx = ensureCountdownAudioContext(); if (!ctx) return;
    try {
        const now = ctx.currentTime; const osc = ctx.createOscillator(); const gain = ctx.createGain();
        const isStart = step === 'start'; const frequency = isStart ? 880 : (step === '3' ? 520 : step === '2' ? 620 : 740);
        osc.type = 'sine'; osc.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime(isStart ? 0.16 : 0.11, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (isStart ? 0.24 : 0.16));
        osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + (isStart ? 0.25 : 0.17));
    } catch (_) {}
}
function getCountdownAudioUrl(step) {
    const map = { '3': '3', '2': '2', '1': '1', start: 'start' };
    const name = map[step]; if (!name) return null;
    return `assets/audio/countdown/ar/${name}.mp3`;
}
const countdownAudioCache = Object.create(null);
const countdownAudioReady = Object.create(null);
function preloadArabicCountdownAudio() {
    if (!('Audio' in window)) return;
    ['3', '2', '1', 'start'].forEach(step => {
        const url = getCountdownAudioUrl(step); if (!url) return;
        try {
            const audio = new Audio(); audio.preload = 'auto'; audio.src = url; audio.setAttribute('playsinline', ''); audio.load();
            countdownAudioCache[step] = audio;
            countdownAudioReady[step] = new Promise(resolve => {
                const done = ok => resolve(ok);
                audio.addEventListener('canplaythrough', () => done(true), { once: true });
                audio.addEventListener('error', () => done(false), { once: true });
                window.setTimeout(() => done(audio.readyState >= 2), 1800);
            });
        } catch (_) {}
    });
}
function playLocalCountdownAudio(step, onAudioStart) {
    const audio = countdownAudioCache[step]; if (!audio) return Promise.resolve(false);
    return new Promise(resolve => {
        let settled = false; let started = false;
        const cleanup = () => { audio.onplaying = null; audio.onended = null; audio.onerror = null; audio.onabort = null; };
        const finish = ok => { if (settled) return; settled = true; cleanup(); resolve(ok); };
        const audioStarted = () => { if (started) return; started = true; try { onAudioStart?.(); } catch (_) {} };
        try {
            audio.pause(); try { audio.currentTime = 0; } catch (_) {}
            audio.volume = 1; audio.onplaying = audioStarted; audio.onended = () => finish(started); audio.onerror = () => finish(false); audio.onabort = () => finish(false);
            const p = audio.play();
            if (p && typeof p.then === 'function') p.catch(() => finish(false));
            if (p && typeof p.then === 'function') p.then(() => { window.setTimeout(() => { if (!started && audio.paused === false) audioStarted(); }, 0); }).catch(() => {});
        } catch (_) { finish(false); }
    });
}
async function speakCountdownStep(step, onAudioStart) {
    const lang = getActiveLanguage();
    if (lang === 'ar') {
        const played = await playLocalCountdownAudio(step, onAudioStart); if (played) return true;
        playCountdownFallbackTone(step); try { onAudioStart?.(); } catch (_) {} return false;
    }
    if (!('speechSynthesis' in window)) { playCountdownFallbackTone(step); try { onAudioStart?.(); } catch (_) {} return false; }
    const speechLang = getCountdownSpeechLocale(); const text = countdownSpeechText(step);
    return new Promise(resolve => {
        let settled = false; let started = false; let timeoutId = null;
        const finish = ok => { if (settled) return; settled = true; if (timeoutId) clearTimeout(timeoutId); resolve(ok); };
        const audioStarted = () => { if (started) return; started = true; try { onAudioStart?.(); } catch (_) {} };
        try {
            window.speechSynthesis.cancel(); window.speechSynthesis.resume();
            const voice = getPreferredSpeechVoice(speechLang); const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = voice?.lang || speechLang; if (voice) utterance.voice = voice;
            utterance.rate = step === 'start' ? 1.05 : 1.15; utterance.pitch = 1.0; utterance.volume = 1.0;
            utterance.onstart = audioStarted; utterance.onend = () => finish(started); utterance.onerror = () => finish(false);
            window.speechSynthesis.speak(utterance);
            timeoutId = window.setTimeout(() => { if (!started) finish(false); }, step === 'start' ? 1800 : 1400);
        } catch (_) { finish(false); }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar.dataset.open) sidebar.dataset.open = 'false';
    repositionSidebar(false);
    if (window.MizanI18n) { try { await window.MizanI18n.init(); } catch (error) { console.warn('[MIZAN ANZAN] i18n initialization failed:', error); } }
    try { setRegistrationRole(document.getElementById('registration-role')?.value || 'genius'); } catch (_) {}
    try { window.MizanCountry?.refresh?.(); } catch (_) {}
    try { primeSpeechEngine(); } catch (_) {}
    try { preloadArabicCountdownAudio(); } catch (_) {}
    void prepareSpeechForCurrentLanguage().catch(() => []);
    updateSpeedDisplay(document.getElementById('speed')?.value || '0.80');
    checkStudentOnboarding(); void flushPendingResults();
    const answerInput = document.getElementById('user-answer');
    if (answerInput) answerInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); GameEngine.submitAnswer(); } });
});

window.addEventListener('online', () => { void flushPendingResults(); });

function toggleSidebar(forceOpen = null) {
    const sidebar = document.getElementById('sidebar'); const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    const current = sidebar.dataset.open === 'true'; const next = typeof forceOpen === 'boolean' ? forceOpen : !current;
    repositionSidebar(next);
    if (overlay) overlay.classList.toggle('hidden', !next);
}

document.addEventListener('keydown', event => { if (event.key === 'Escape') toggleSidebar(false); });
document.addEventListener('click', event => {
    const sidebar = document.getElementById('sidebar'); const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !overlay || sidebar.dataset.open !== 'true') return;
    if (event.target === overlay) toggleSidebar(false);
});

function switchView(panelId) {
    document.getElementById('setup-panel').classList.add('hidden');
    document.getElementById('game-panel').classList.add('hidden');
    document.getElementById(panelId).classList.remove('hidden');
}
function openRegistrationModal() { document.getElementById('onboarding-modal').classList.remove('hidden'); }

function normalizeStudentProfile(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const code = String(raw.code ?? raw.student_code ?? raw.anz_id ?? raw.anzId ?? '').trim();
    const fullName = String(raw.fullName ?? raw.full_name ?? raw.student_name ?? raw.name ?? '').trim();
    const country = String(raw.country ?? raw.student_country ?? raw.nationality ?? '').trim();
    if (!code || !fullName || !country) return null;
    return { ...raw, code, fullName, country, studentId: Number(raw.studentId ?? raw.student_id ?? raw.id ?? 0) || 0, anzId: String(raw.anzId ?? raw.anz_id ?? code).trim() || code };
}

function readSavedStudentProfile() {
    const keys = ['anzan_student_profile', 'mizan_anzan_student_profile', 'anzan_student', 'student_profile'];
    for (const key of keys) {
        try {
            const raw = localStorage.getItem(key); if (!raw) continue;
            const profile = normalizeStudentProfile(JSON.parse(raw)); if (profile) return profile;
        } catch (error) { console.warn(`[MIZAN ANZAN] Invalid stored profile in ${key}:`, error); }
    }
    return null;
}

async function checkStudentOnboarding() {
    const savedProfile = readSavedStudentProfile();
    if (!savedProfile) { AppState.student = null; openRegistrationModal(); return; }
    AppState.student = savedProfile; localStorage.setItem('anzan_student_profile', JSON.stringify(AppState.student)); updateStudentUI();
    try {
        const response = await fetch('api/restore-session.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', cache: 'no-store', body: JSON.stringify({ student_code: AppState.student.code }) });
        const data = await response.json();
        if (response.ok && data.success && data.student) {
            AppState.student = normalizeStudentProfile({ ...AppState.student, id: data.student.id ?? AppState.student.studentId, student_id: data.student.student_id ?? AppState.student.studentId, anz_id: data.student.anz_id ?? AppState.student.anzId, full_name: data.student.full_name ?? AppState.student.fullName, country: data.student.country ?? AppState.student.country, student_code: data.student.student_code ?? AppState.student.code }) || AppState.student;
            localStorage.setItem('anzan_student_profile', JSON.stringify(AppState.student)); updateStudentUI();
        } else if (response.status === 404) { console.warn('[MIZAN ANZAN] Server session restore returned 404; keeping local student profile.'); updateStudentUI(); }
    } catch (error) { console.error('[MIZAN ANZAN] Session restore failed:', error); updateStudentUI(); }
}

function showGeniusRegistrationSuccess(student) {
    const existing = document.getElementById('mizan-genius-registration-success'); existing?.remove();
    const lang = (typeof getActiveLanguage === 'function' ? getActiveLanguage() : 'ar').split('-')[0];
    const isArabic = lang === 'ar'; const isFrench = lang === 'fr';
    const title = isFrench ? 'Inscription réussie' : lang === 'en' ? 'Registration Successful' : 'تم إنشاء هويتك بنجاح';
    const desc = isFrench ? 'Votre identité numérique MIZAN a été créée avec succès. Ce code est votre numéro officiel sur la plateforme.' : lang === 'en' ? 'Your MIZAN digital identity has been created successfully. This code is your official registration number on the platform.' : 'تم إنشاء هويتك الرقمية في ميزان أنزان بنجاح. هذا الرقم هو رقم تسجيلك الرسمي على المنصة.';
    const codeLabel = isFrench ? 'Votre numéro d’inscription' : lang === 'en' ? 'Your Registration Number' : 'رقم تسجيلك الرسمي';
    const copyLabel = isFrench ? 'Copier le numéro' : lang === 'en' ? 'Copy Registration Number' : 'نسخ رقم التسجيل';
    const copiedLabel = isFrench ? 'Numéro copié ✓' : lang === 'en' ? 'Registration Number Copied ✓' : 'تم نسخ رقم التسجيل ✓';
    const copyFailedLabel = isFrench ? 'Sélectionnez le numéro et copiez-le manuellement.' : lang === 'en' ? 'Please select the number and copy it manually.' : 'يرجى تحديد الرقم ونسخه يدويًا.';
    const warning = isFrench ? 'Important : conservez ce numéro dans un endroit sûr. Vous en aurez besoin pour accéder à votre identité, vos résultats et votre historique.' : lang === 'en' ? 'Important: Keep this number in a safe place. You will need it to access your identity, results and history.' : 'مهم: احتفظ بهذا الرقم في مكان آمن. ستحتاج إليه للوصول إلى هويتك ونتائجك وسجل إنجازاتك.';
    const startLabel = isFrench ? 'Commencer le défi' : lang === 'en' ? 'Start Challenge' : 'ابدأ التحدي الآن';
    const homeLabel = isFrench ? 'Retour à la page d’accueil' : lang === 'en' ? 'Return to Home' : 'العودة إلى الصفحة الرئيسية';
    const note = isFrench ? 'Conservez votre numéro d’inscription. Votre parcours peut commencer lorsque vous êtes prêt.' : lang === 'en' ? 'Keep your registration number safe. Your journey can begin when you are ready.' : 'احتفظ برقم تسجيلك الرسمي. يمكنك بدء رحلتك عندما تكون مستعدًا.';
    const dir = isArabic ? 'rtl' : 'ltr';
    const registrationCode = String(student?.code || student?.genius_code || student?.anz_id || '').trim();
    if (!registrationCode) { console.error('[MIZAN ANZAN] Genius success modal requested without registration code.'); return; }

    const overlay = document.createElement('div');
    overlay.id = 'mizan-genius-registration-success'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('dir', dir);
    overlay.style.cssText = ['position:fixed','inset:0','z-index:100000','display:flex','align-items:center','justify-content:center','padding:20px','background:rgba(0,0,0,.82)','backdrop-filter:blur(10px)'].join(';');

    const card = document.createElement('div');
    card.style.cssText = ['width:min(100%,520px)','max-height:90vh','overflow:auto','background:#07111f','border:1px solid rgba(212,175,55,.65)','border-radius:24px','box-shadow:0 30px 100px rgba(0,0,0,.65)','color:#fff','padding:28px 24px','text-align:center','font-family:Segoe UI,Tahoma,Arial,sans-serif'].join(';');
    card.innerHTML = `
        <div style="width:70px;height:70px;margin:0 auto 16px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(16,185,129,.10);border:1px solid rgba(52,211,153,.45);font-size:38px;color:#6ee7b7;">✓</div>
        <div style="font-size:26px;font-weight:900;color:#f4d35e;line-height:1.35;">${escapeHtml(title)}</div>
        <div style="margin-top:10px;color:#cbd5e1;font-size:14px;line-height:1.9;">${escapeHtml(desc)}</div>
        <div style="margin-top:22px;padding:18px;border-radius:18px;background:rgba(0,0,0,.35);border:1px solid rgba(212,175,55,.42);">
            <div style="font-size:12px;color:#f4d35e;font-weight:800;">${escapeHtml(codeLabel)}</div>
            <div id="mizan-genius-registration-code" tabindex="0" style="margin-top:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:27px;font-weight:900;letter-spacing:1px;color:#facc15;user-select:all;word-break:break-all;cursor:text;">${escapeHtml(registrationCode)}</div>
            <button type="button" id="mizan-genius-copy-code" style="margin-top:14px;width:100%;border:1px solid rgba(212,175,55,.45);border-radius:12px;padding:11px 14px;background:rgba(212,175,55,.09);color:#f4d35e;font-weight:900;font-size:13px;cursor:pointer;">${escapeHtml(copyLabel)}</button>
            <div id="mizan-genius-copy-status" aria-live="polite" style="min-height:18px;margin-top:8px;color:#6ee7b7;font-size:12px;font-weight:700;"></div>
            <div style="margin-top:12px;color:#94a3b8;font-size:12px;line-height:1.8;">${escapeHtml(warning)}</div>
        </div>
        <div style="margin-top:18px;color:#94a3b8;font-size:12px;">${escapeHtml(note)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px;">
            <button type="button" id="mizan-genius-start" style="border:0;border-radius:13px;padding:14px 10px;background:linear-gradient(90deg,#f4b400,#f59e0b);color:#050505;font-weight:900;cursor:pointer;">${escapeHtml(startLabel)}</button>
            <button type="button" id="mizan-genius-home" style="border:1px solid rgba(148,163,184,.35);border-radius:13px;padding:14px 10px;background:#182336;color:#fff;font-weight:800;cursor:pointer;">${escapeHtml(homeLabel)}</button>
        </div>`;
    overlay.appendChild(card); document.body.appendChild(overlay);

    const copyButton = document.getElementById('mizan-genius-copy-code');
    const copyStatus = document.getElementById('mizan-genius-copy-status');
    const codeElement = document.getElementById('mizan-genius-registration-code');
    copyButton?.addEventListener('click', async () => {
        const code = registrationCode; if (!code) return;
        let copied = false;
        try { if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') { await navigator.clipboard.writeText(code); copied = true; } } catch (_) { copied = false; }
        if (!copied) {
            try { const textarea = document.createElement('textarea'); textarea.value = code; textarea.setAttribute('readonly', ''); textarea.style.position = 'fixed'; textarea.style.left = '-9999px'; textarea.style.top = '0'; textarea.style.opacity = '0'; textarea.style.pointerEvents = 'none'; document.body.appendChild(textarea); textarea.focus(); textarea.select(); textarea.setSelectionRange(0, textarea.value.length); copied = document.execCommand('copy'); textarea.remove(); } catch (_) { copied = false; }
        }
        if (copied) {
            const originalText = copyButton.textContent; copyButton.textContent = copiedLabel; copyButton.style.background = 'rgba(16,185,129,.14)'; copyButton.style.borderColor = 'rgba(52,211,153,.55)'; copyButton.style.color = '#6ee7b7';
            if (copyStatus) copyStatus.textContent = copiedLabel;
            setTimeout(() => { if (!document.body.contains(copyButton)) return; copyButton.textContent = originalText || copyLabel; copyButton.style.background = 'rgba(212,175,55,.09)'; copyButton.style.borderColor = 'rgba(212,175,55,.45)'; copyButton.style.color = '#f4d35e'; if (copyStatus) copyStatus.textContent = ''; }, 2200);
            return;
        }
        if (codeElement) { try { const selection = window.getSelection(); const range = document.createRange(); range.selectNodeContents(codeElement); selection?.removeAllRanges(); selection?.addRange(range); codeElement.focus(); } catch (_) {} }
        if (copyStatus) { copyStatus.textContent = copyFailedLabel; copyStatus.style.color = '#fbbf24'; }
    });

    const closeAndStart = () => {
        overlay.remove(); document.getElementById('onboarding-modal')?.classList.add('hidden');
        document.getElementById('registration-form')?.classList.remove('hidden');
        document.querySelector('#onboarding-modal .grid.grid-cols-2')?.classList.remove('hidden');
        if (typeof switchView === 'function') switchView('setup-panel');
        document.getElementById('config-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const closeAndHome = () => {
        overlay.remove(); document.getElementById('onboarding-modal')?.classList.add('hidden');
        document.getElementById('registration-form')?.classList.remove('hidden');
        document.querySelector('#onboarding-modal .grid.grid-cols-2')?.classList.remove('hidden');
        if (typeof switchView === 'function') switchView('setup-panel');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    document.getElementById('mizan-genius-start')?.addEventListener('click', closeAndStart);
    document.getElementById('mizan-genius-home')?.addEventListener('click', closeAndHome);
}

async function registerFirstTimeStudent() {
    const fullName = document.getElementById('reg-fullname')?.value.trim() || '';
    const displayNameEn = document.getElementById('reg-display-name-en')?.value.trim() || '';
    const countryCode = String(document.getElementById('reg-country')?.value || '').trim().toUpperCase();
    const button = document.querySelector('#onboarding-modal form button[type="submit"]');
    const result = document.getElementById('registration-result');
    if (!fullName || !countryCode || !window.MizanCountry?.ISO_CODES?.includes(countryCode)) {
        const message = translateText('country_required', 'يرجى اختيار الدولة.');
        if (result) { result.className = 'p-4 rounded-xl bg-red-500/10 border border-red-400/20 text-red-200 text-sm'; result.textContent = message; result.classList.remove('hidden'); }
        return;
    }
    if (button) { button.disabled = true; button.dataset.originalText = button.textContent; button.textContent = '...'; }
    try {
        const response = await fetch('api/register-student.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', cache: 'no-store', body: JSON.stringify({ full_name: fullName, display_name_en: displayNameEn, country_code: countryCode }) });
        const raw = await response.text(); let data = {};
        try { data = raw ? JSON.parse(raw) : {}; } catch (_) { data = { message: raw.slice(0, 240) }; }
        if (!response.ok || !data.success || !data.student?.code) { const error = new Error(data.message || `Registration failed (HTTP ${response.status})`); error.code = data.error_code || `HTTP_${response.status}`; throw error; }
        AppState.student = { code: data.student.code, fullName: data.student.full_name || fullName, country: data.student.country || countryCode, countryCode: data.student.country_code || countryCode, studentId: Number(data.student.id || 0), anzId: data.student.anz_id || data.student.code };
        localStorage.setItem('anzan_student_profile', JSON.stringify(AppState.student)); updateStudentUI();
        showGeniusRegistrationSuccess(AppState.student);
    } catch (error) {
        console.error('[MIZAN ANZAN] Student registration failed:', error);
        if (result) { result.className = 'p-4 rounded-xl bg-red-500/10 border border-red-400/20 text-red-200 text-sm'; result.textContent = translateText('registration_failed', error.message || 'تعذر إكمال التسجيل.'); result.classList.remove('hidden'); }
    } finally { if (button) { button.disabled = false; button.textContent = button.dataset.originalText || 'إنشاء كود العبقري والدخول'; } }
}

function updateStudentUI() {
    const codeEl = document.getElementById('side-student-code'); const infoEl = document.getElementById('side-student-info');
    if (!codeEl || !infoEl) return;
    const student = normalizeStudentProfile(AppState.student);
    if (!student) { codeEl.textContent = '-----'; infoEl.textContent = '-----'; return; }
    AppState.student = student; codeEl.textContent = student.code;
    let countryLabel = student.country;
    try { const code = String(student.country || '').toUpperCase(); const displayNames = typeof Intl !== 'undefined' && Intl.DisplayNames ? new Intl.DisplayNames([document.documentElement.lang || 'ar', 'en'], { type: 'region' }) : null; countryLabel = displayNames?.of(code) || code; } catch (_) {}
    infoEl.textContent = `${student.fullName} (${countryLabel})`;
}

function showChallengeResultModal(resultId, language = getActiveLanguage()) {
    const existing = document.getElementById('mizan-result-modal'); existing?.remove();
    const lang = window.MizanI18n?.meta?.[language] ? language : getActiveLanguage();
    const isRTL = window.MizanI18n?.meta?.[lang]?.dir === 'rtl';
    const score = Number(AppState.game.score) || 0; const correct = Number(AppState.game.totalCorrect) || 0; const total = Number(AppState.game.totalAttempted) || 0;
    const labels = { title: translateText('result_title', 'Challenge Complete!'), subtitle: translateText('result_subtitle', 'Your challenge result is ready for review.'), score: translateText('result_score', 'Total Score:'), correct: translateText('result_correct', 'Correct Answers:'), saved: translateText('result_saved', 'The result was saved successfully.'), open: translateText('result_open_report', 'Open Report'), cont: translateText('result_continue', 'Continue') };
    const modal = document.createElement('div');
    modal.id = 'mizan-result-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    modal.style.cssText = ['position:fixed','inset:0','z-index:99999','display:flex','align-items:center','justify-content:center','padding:20px','background:rgba(0,0,0,.78)','backdrop-filter:blur(10px)'].join(';');
    modal.innerHTML = `<div style="width:min(100%,410px);background:#0a1424;border:1px solid rgba(212,175,55,.55);border-radius:22px;box-shadow:0 25px 80px rgba(0,0,0,.55);overflow:hidden;color:#fff;font-family:Segoe UI,Tahoma,Arial,sans-serif;text-align:center;">
        <div style="padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,.10);"><div style="width:58px;height:58px;margin:0 auto 12px;border-radius:50%;border:1px solid rgba(212,175,55,.65);display:flex;align-items:center;justify-content:center;background:rgba(212,175,55,.07);overflow:hidden;"><img src="logo.jpg" alt="Mizan Anzan" style="width:48px;height:48px;object-fit:contain;border-radius:50%;" onerror="this.onerror=null;this.src='/mizan_anzan/logo.jpg';"></div><h2 style="margin:0;color:#f4d35e;font-size:24px;font-weight:900;">${escapeHtml(labels.title)}</h2><p style="margin:7px 0 0;color:#94a3b8;font-size:13px;">${escapeHtml(labels.subtitle)}</p></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:18px 20px;"><div style="background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;"><div style="font-size:11px;color:#94a3b8;">${escapeHtml(labels.score)}</div><div style="font-size:28px;font-weight:900;color:#f4d35e;margin-top:3px;">${score}</div></div><div style="background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;"><div style="font-size:11px;color:#94a3b8;">${escapeHtml(labels.correct)}</div><div style="font-size:28px;font-weight:900;color:#65e6b5;margin-top:3px;">${correct} <span style="font-size:15px;color:#94a3b8;">/ ${total}</span></div></div></div>
        <div style="margin:0 20px 18px;padding:13px 14px;border-radius:13px;background:rgba(16,185,129,.10);border:1px solid rgba(16,185,129,.55);color:#65e6b5;font-size:13px;font-weight:700;line-height:1.55;">${escapeHtml(labels.saved)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:18px 20px;border-top:1px solid rgba(255,255,255,.10);"><button type="button" id="mizan-open-report" style="border:0;border-radius:12px;padding:12px 10px;background:linear-gradient(90deg,#f4b400,#f59e0b);color:#050505;font-weight:900;cursor:pointer;">${escapeHtml(labels.open)}</button><button type="button" id="mizan-continue" style="border:1px solid rgba(148,163,184,.35);border-radius:12px;padding:12px 10px;background:#182336;color:#fff;font-weight:800;cursor:pointer;">${escapeHtml(labels.cont)}</button></div></div>`;
    document.body.appendChild(modal);
    const reportUrl = `generate_report.php?id=${encodeURIComponent(resultId)}&lang=${encodeURIComponent(lang)}`;
    const persistLanguage = () => { try { localStorage.setItem('mizan_anzan_lang', lang); document.cookie = `mizan_anzan_lang=${encodeURIComponent(lang)}; path=/; max-age=31536000; SameSite=Lax`; } catch (_) {} };
    document.getElementById('mizan-open-report')?.addEventListener('click', () => { persistLanguage(); window.location.href = reportUrl; });
    document.getElementById('mizan-continue')?.addEventListener('click', () => { modal.remove(); switchView('setup-panel'); });
    modal.addEventListener('click', event => { if (event.target === modal) { modal.remove(); switchView('setup-panel'); } });
}

const GameEngine = {
    async initGameSequence() {
        AppState.config.mode = document.querySelector('input[name="training_mode"]:checked').value; AppState.config.level = document.getElementById('level-type').value; AppState.config.ageGroup = document.getElementById('age-group').value; AppState.config.digits = parseInt(document.getElementById('digits').value); AppState.config.rows = parseInt(document.getElementById('rows').value); AppState.config.operation = document.getElementById('operation-type').value; AppState.config.duration = parseInt(document.getElementById('challenge-time').value); AppState.config.restTime = parseInt(document.getElementById('rest-time').value); AppState.config.speed = parseFloat(document.getElementById('speed').value); AppState.config.useTTS = document.getElementById('enable-tts')?.checked === true;
        ensureCountdownAudioContext(); primeSpeechEngine(); await prepareSpeechForCurrentLanguage();
        AppState.game.score = 0; AppState.game.totalAttempted = 0; AppState.game.totalCorrect = 0; AppState.game.active = true; AppState.game.timeLeft = AppState.config.duration;
        document.getElementById('game-score').textContent = '0'; updateChallengeTimerUI(); switchView('game-panel');
        void this.runCountdownSequence(() => { this.startMainTimer(); void this.nextQuestion(); });
    },
    async runCountdownSequence(onComplete) {
        const display = document.getElementById('flash-display'); const sorobanDisp = document.getElementById('soroban-display');
        if (!display) { onComplete(); return; }
        if (AppState.game.countdownTimer) { clearTimeout(AppState.game.countdownTimer); AppState.game.countdownTimer = null; }
        sorobanDisp?.classList.add('hidden'); display.classList.remove('hidden'); display.textContent = '';
        if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); window.speechSynthesis.resume(); } catch (_) {} }
        const steps = ['3', '2', '1', 'start']; const minimumStepMs = 620;
        const renderStep = step => { const visualText = getCountdownVisualText(step); display.textContent = visualText; display.setAttribute('aria-label', visualText); display.classList.remove('flash-anim'); void display.offsetWidth; display.classList.add('flash-anim'); };
        for (const step of steps) {
            if (!AppState.game.active) return;
            const startedAt = performance.now(); let visualRendered = false;
            const renderOnce = () => { if (visualRendered) return; visualRendered = true; renderStep(step); };
            await speakCountdownStep(step, renderOnce); renderOnce();
            const elapsed = performance.now() - startedAt; const remaining = Math.max(0, minimumStepMs - elapsed);
            if (remaining > 0) await new Promise(resolve => { AppState.game.countdownTimer = setTimeout(() => { AppState.game.countdownTimer = null; resolve(); }, remaining); });
        }
        if (!AppState.game.active) return; onComplete();
    },
    startMainTimer() {
        if (AppState.game.timer) clearInterval(AppState.game.timer);
        AppState.game.timeLeft = Math.max(0, Number(AppState.config.duration) || 0); updateChallengeTimerUI();
        AppState.game.timer = setInterval(() => {
            if (!AppState.game.active) { clearInterval(AppState.game.timer); AppState.game.timer = null; return; }
            AppState.game.timeLeft = Math.max(0, AppState.game.timeLeft - 1); updateChallengeTimerUI();
            if (AppState.game.timeLeft <= 0) { clearInterval(AppState.game.timer); AppState.game.timer = null; this.finishGame(); }
        }, 1000);
    },
    generateNumbers() {
        const { digits, rows, operation, level } = AppState.config;
        const levelMap = Object.freeze({ L1: MizanAnzanSoroban.LEVELS.SIMPLE, L2: MizanAnzanSoroban.LEVELS.F5, L3: MizanAnzanSoroban.LEVELS.F10, LM: MizanAnzanSoroban.LEVELS.MIX });
        const engineLevel = levelMap[level]; if (!engineLevel) throw new Error(`Unsupported Mizan Anzan level: ${level}`);
        const sequence = MizanAnzanSoroban.generateSequence({ digits, rows, operation, level: engineLevel, allowNegative: false, maxGenerationAttempts: 300, candidatesPerRow: 40 });
        AppState.game.engineSequence = sequence; AppState.game.numbers = sequence.terms.map((term, index) => { const value = BigInt(term); return { val: value < 0n ? -value : value, op: index === 0 ? '+' : (value < 0n ? '-' : '+') }; });
        AppState.game.correctResult = BigInt(sequence.answer); return sequence;
    },
    speakNumber(text) {
        if (!AppState.config.useTTS || !('speechSynthesis' in window)) return Promise.resolve(false);
        const value = String(text || '').trim(); if (!value) return Promise.resolve(false);
        const speechLang = getCurrentLocaleMeta().speech || 'ar-SA';
        try {
            window.speechSynthesis.cancel(); window.speechSynthesis.resume();
            const utterance = new SpeechSynthesisUtterance(value); const voice = getPreferredSpeechVoice(speechLang);
            utterance.lang = voice?.lang || speechLang; if (voice) utterance.voice = voice;
            const displaySeconds = Math.max(0.05, Number(AppState.config.speed) || 0.8);
            utterance.rate = Math.min(3.2, Math.max(1.8, 1.25 / displaySeconds)); utterance.pitch = 1.0; utterance.volume = 1;
            utterance.onerror = error => { console.warn('[MIZAN ANZAN] Number speech error:', error?.error || error); };
            window.speechSynthesis.speak(utterance); return Promise.resolve(true);
        } catch (error) { console.warn('[MIZAN ANZAN] Number speech unavailable:', error); return Promise.resolve(false); }
    },
    async nextQuestion() {
        document.getElementById('answer-box').classList.add('hidden'); document.getElementById('result-feedback').classList.add('hidden');
        try { this.generateNumbers(); } catch (error) {
            console.error('[MIZAN ANZAN] Challenge generation failed:', error);
            const display = document.getElementById('flash-display'); display.classList.remove('hidden');
            display.innerHTML = `<span class="text-red-400 font-bold">${escapeHtml(translateText('challenge_generation_failed', translateText('generation_error')))}</span>`;
            AppState.game.active = false; if (AppState.game.timer) { clearInterval(AppState.game.timer); AppState.game.timer = null; } return;
        }
        if (AppState.config.mode === 'flash') {
            const display = document.getElementById('flash-display'); const sorobanDisp = document.getElementById('soroban-display');
            sorobanDisp.classList.add('hidden'); display.classList.remove('hidden'); const speedMs = AppState.config.speed * 1000;
            for (let i = 0; i < AppState.game.numbers.length; i++) {
                const item = AppState.game.numbers[i];
                const signStr = item.op === '-' ? '<span class="text-red-400 font-bold ml-2">-</span>' : (i > 0 ? '<span class="text-green-400 font-bold ml-2">+</span>' : '');
                display.innerHTML = `${signStr}${item.val}`; display.classList.remove('flash-anim'); void display.offsetWidth; display.classList.add('flash-anim');
                void this.speakNumber(String(item.val)); await new Promise(r => setTimeout(r, speedMs)); display.innerHTML = ''; await new Promise(r => setTimeout(r, 60));
            }
            display.innerHTML = '<span class="text-yellow-400 font-black">؟</span>';
        } else {
            const display = document.getElementById('flash-display'); const sorobanDisp = document.getElementById('soroban-display');
            display.classList.add('hidden'); sorobanDisp.classList.remove('hidden');
            sorobanDisp.innerHTML = AppState.game.numbers.map((item, i) => { const sign = item.op === '-' ? '-' : (i > 0 ? '+' : ''); return `<div class="font-mono text-2xl font-bold">${sign} ${item.val}</div>`; }).join('<div class="border-b border-white/10 w-32 mx-auto my-1"></div>');
        }
        document.getElementById('answer-box').classList.remove('hidden');
        const input = document.getElementById('user-answer');
        if (input) { input.setAttribute('placeholder', translateText('answer_placeholder')); input.value = ''; input.dir = AppState.lang === 'ar' ? 'rtl' : 'ltr'; input.focus(); }
    },
    submitAnswer() {
        const inputEl = document.getElementById('user-answer'); if (!inputEl.value.trim()) return;
        let userVal;
        try { const normalized = inputEl.value.trim().replace(/[٬,\s]/g, ''); if (!/^-?\d+$/.test(normalized)) throw new Error('invalid_integer'); userVal = BigInt(normalized); } catch (error) {
            const feedback = document.getElementById('result-feedback'); feedback.className = "text-center p-4 rounded-xl font-bold text-lg bg-red-500/20 text-red-300 border border-red-500/30"; feedback.textContent = translateText('invalid_integer'); feedback.classList.remove('hidden'); return;
        }
        const feedback = document.getElementById('result-feedback'); AppState.game.totalAttempted++;
        const isCorrect = userVal === AppState.game.correctResult;
        if (isCorrect) { AppState.game.score += 10; AppState.game.totalCorrect++; document.getElementById('game-score').textContent = AppState.game.score; feedback.className = "text-center p-4 rounded-xl font-bold text-lg bg-green-500/20 text-green-300 border border-green-500/30"; feedback.textContent = translateText('correct_feedback'); }
        else { feedback.className = "text-center p-4 rounded-xl font-bold text-lg bg-red-500/20 text-red-300 border border-red-500/30"; feedback.textContent = `${translateText('incorrect_feedback')} ${AppState.game.correctResult}`; }
        feedback.classList.remove('hidden'); document.getElementById('answer-box').classList.add('hidden');
        const restMs = AppState.config.restTime * 1000; setTimeout(() => { if (AppState.game.active && AppState.game.timeLeft > 0) this.nextQuestion(); }, restMs);
    },
    stop() {
        AppState.game.active = false; if (AppState.game.timer) { clearInterval(AppState.game.timer); AppState.game.timer = null; }
        if (AppState.game.countdownTimer) { clearTimeout(AppState.game.countdownTimer); AppState.game.countdownTimer = null; }
        if ('speechSynthesis' in window) window.speechSynthesis.cancel(); switchView('setup-panel');
    },
    async finishGame() {
        AppState.game.active = false; if (AppState.game.timer) { clearInterval(AppState.game.timer); AppState.game.timer = null; }
        if (AppState.game.countdownTimer) { clearTimeout(AppState.game.countdownTimer); AppState.game.countdownTimer = null; }
        updateChallengeTimerUI(); if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        const saved = await saveResultToDatabase(); const language = getActiveLanguage();
        if (saved?.result_id) { showChallengeResultModal(saved.result_id, language); return; }
        const baseMessage = `${translateText('challenge_complete')}\n${translateText('total_score')} ${AppState.game.score}\n${translateText('correct_answers')} ${AppState.game.totalCorrect} ${translateText('of_word')} ${AppState.game.totalAttempted}`;
        if (saved?.queued) alert(`${baseMessage}\n\n${translateText('save_queued')}`); else alert(`${baseMessage}\n\n${translateText('save_failed')}`);
        switchView('setup-panel');
    }
};

let leaderboardData = []; let currentLeaderboardSort = { key: 'points', direction: 'desc' };
const PENDING_RESULTS_KEY = 'mizan_anzan_pending_results_v1';
function readPendingResults() { try { const raw = localStorage.getItem(PENDING_RESULTS_KEY); const data = raw ? JSON.parse(raw) : []; return Array.isArray(data) ? data : []; } catch (_) { return []; } }
function writePendingResults(results) { try { localStorage.setItem(PENDING_RESULTS_KEY, JSON.stringify(results.slice(-10))); } catch (error) { console.warn('[MIZAN ANZAN] Unable to persist pending results:', error); } }
function queuePendingResult(payload) { const queue = readPendingResults(); const key = `${payload.student_code}|${payload.client_attempt_id}`; const withoutDuplicate = queue.filter(item => `${item.student_code}|${item.client_attempt_id}` !== key); withoutDuplicate.push({ ...payload, queued_at: new Date().toISOString() }); writePendingResults(withoutDuplicate); return key; }
function removePendingResult(clientAttemptId) { const queue = readPendingResults().filter(item => item.client_attempt_id !== clientAttemptId); writePendingResults(queue); }
async function postResultPayload(payload, attempt = 1) {
    const endpoint = '/mizan_anzan/api/save-result.php'; const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, credentials: 'same-origin', cache: 'no-store', keepalive: true, body: JSON.stringify(payload) });
    const raw = await response.text(); let data; try { data = JSON.parse(raw); } catch (_) { const error = new Error(`save_http_${response.status}`); error.httpStatus = response.status; error.raw = raw.slice(0, 500); throw error; }
    if (!response.ok || !data.success || !data.result_id) { const error = new Error(data?.message || 'save_failed'); error.serverData = data; error.httpStatus = response.status; throw error; }
    console.info('[MIZAN ANZAN] Result saved successfully.', { result_id: data.result_id, attempt, student_code: data.student_code }); return data;
}
async function flushPendingResults() { const queue = readPendingResults(); if (!queue.length) return; for (const payload of queue) { try { const data = await postResultPayload(payload, 1); if (data?.result_id) removePendingResult(payload.client_attempt_id); } catch (error) { console.warn('[MIZAN ANZAN] Pending result still waiting for server:', error); break; } } }
async function saveResultToDatabase() {
    if (!AppState.student?.code) { console.error('[MIZAN ANZAN] Result save skipped: no student code.'); return null; }
    const totalQuestions = Math.max(0, Number(AppState.game.totalAttempted) || 0); if (totalQuestions <= 0) { console.warn('[MIZAN ANZAN] Result save skipped: no answered questions.'); return null; }
    if (AppState.game.saveInProgress) return null; AppState.game.saveInProgress = true;
    const elapsedSeconds = Math.max(0, AppState.config.duration - AppState.game.timeLeft); const clientAttemptId = `ANZ-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const payload = { client_attempt_id: clientAttemptId, student_code: AppState.student.code, student_id: AppState.student.studentId || null, student_name: AppState.student.fullName || '', country: AppState.student.country || '', age_category: AppState.config.ageGroup, operation_type: AppState.config.operation, training_mode: AppState.config.mode, level: AppState.config.level, preset: document.getElementById('standard-preset-select')?.value || 'custom', digits_count: AppState.config.digits, rows_count: AppState.config.rows, speed_ms: Math.round(AppState.config.speed * 1000), duration_seconds: AppState.config.duration, time_taken_seconds: elapsedSeconds, avg_time_per_question: elapsedSeconds / totalQuestions, total_questions: totalQuestions, correct_answers: AppState.game.totalCorrect, score: AppState.game.score, language: getActiveLanguage() };
    try {
        for (let attempt = 1; attempt <= 4; attempt++) {
            try { const data = await postResultPayload(payload, attempt); AppState.game.lastResultId = Number(data.result_id) || null; removePendingResult(clientAttemptId); return data; }
            catch (error) { console.error(`[MIZAN ANZAN] Result save attempt ${attempt} failed:`, error); if (attempt < 4) await new Promise(resolve => setTimeout(resolve, 500 * attempt)); }
        }
        queuePendingResult(payload); return { queued: true, result_id: null };
    } finally { AppState.game.saveInProgress = false; }
}

async function fetchLeaderboardData(criterion = 'overall') {
    try {
        const response = await fetch(`api/leaderboard.php?action=get&criterion=${encodeURIComponent(criterion)}&limit=20`, { credentials: 'same-origin', cache: 'no-store' });
        const data = await response.json(); if (!response.ok || !data.success || !Array.isArray(data.data)) throw new Error(data.error || 'leaderboard_failed');
        leaderboardData = data.data.map(item => ({ code: item.genius_code || item.student_code || '', country: item.country || '', name: item.name || '', ageKey: `age_${item.age_category || '7_9'}`, level: item.level || 'L1', accuracy: Number(item.avg_accuracy || item.accuracy || 0), mgi: Number(item.competition_score || item.mgi || 0), consistency: Number(item.consistency_score || 0), speed: Number(item.speed_score || 0), progress: Number(item.progress_score || 0), points: Number(item.total_points || 0), sessions: Number(item.sessions || 0), questions: Number(item.questions || 0), trainingDays: Number(item.training_days || 0) }));
        return leaderboardData;
    } catch (error) { console.error('[MIZAN ANZAN] Leaderboard load failed:', error); leaderboardData = []; return []; }
}
function sortLeaderboard(key) {
    if (currentLeaderboardSort.key === key) currentLeaderboardSort.direction = currentLeaderboardSort.direction === 'desc' ? 'asc' : 'desc';
    else { currentLeaderboardSort.key = key; currentLeaderboardSort.direction = key === 'speed' ? 'asc' : 'desc'; }
    DashboardManager.openLeaderboard();
}

const DashboardManager = {
    currentView: null, leaderboardCriterion: 'overall',
    closeModal() { document.getElementById('modal-container').classList.add('hidden'); this.currentView = null; },
    async openLeaderboard(criterion = this.leaderboardCriterion) {
        this.currentView = 'leaderboard'; this.leaderboardCriterion = criterion; await fetchLeaderboardData(criterion);
        const modal = document.getElementById('modal-container'), content = document.getElementById('modal-content'); if (!modal || !content) return;
        const labels = { overall: translateText('leaderboard_title', 'Overall'), accuracy: translateText('accuracy_metric', 'Accuracy'), speed: translateText('perf_metric', 'Speed'), consistency: translateText('focus_metric', 'Consistency'), progress: translateText('growth_metric', 'Growth'), points: translateText('points_metric', 'Points') };
        const title = labels[criterion] || labels.overall;
        content.innerHTML = `<div class="space-y-6"><div class="text-center border-b border-white/10 pb-4"><h2 class="text-2xl font-black text-yellow-400"><i class="fas fa-trophy ml-2"></i>${escapeHtml(translateText('leaderboard_title'))}</h2><p class="text-sm text-gray-300">${escapeHtml(title)}</p><p class="text-xs text-gray-400 mt-1">${escapeHtml(translateText('portal_desc', 'The leaderboard measures a criterion; it does not define the whole genius.'))}</p></div>
        <div class="flex flex-wrap gap-2 justify-center">${Object.keys(labels).map(k => `<button onclick="DashboardManager.openLeaderboard('${k}')" class="px-3 py-2 rounded-lg border ${k === criterion ? 'border-yellow-400 bg-yellow-500/15 text-yellow-300' : 'border-white/10 text-gray-300'} text-xs font-bold">${escapeHtml(labels[k])}</button>`).join('')}</div>
        <div class="overflow-x-auto"><table class="w-full text-xs text-right border-collapse"><thead><tr class="bg-black/50 text-yellow-400"><th class="p-3">#</th><th class="p-3">${escapeHtml(translateText('th_name'))}</th><th class="p-3">${escapeHtml(translateText('th_country'))}</th><th class="p-3">${escapeHtml(translateText('student_code_label', 'Genius Code'))}</th><th class="p-3">${escapeHtml(translateText('accuracy_metric'))}</th><th class="p-3">${escapeHtml(translateText('focus_metric', 'Consistency'))}</th><th class="p-3">${escapeHtml(translateText('perf_metric', 'Speed'))}</th><th class="p-3">${escapeHtml(translateText('growth_metric', 'Growth'))}</th><th class="p-3">${escapeHtml(translateText('th_points'))}</th></tr></thead><tbody>${leaderboardData.length ? leaderboardData.slice(0, 20).map((x, i) => `<tr class="border-b border-white/5 ${i < 3 ? 'font-bold text-yellow-200' : ''}"><td class="p-3">${i + 1}</td><td class="p-3 font-bold">${escapeHtml(x.name)}</td><td class="p-3">${escapeHtml(x.country)}</td><td class="p-3 font-mono text-yellow-400">${escapeHtml(x.code)}</td><td class="p-3">${x.accuracy.toFixed(1)}%</td><td class="p-3">${x.consistency.toFixed(1)}</td><td class="p-3">${x.speed.toFixed(1)}</td><td class="p-3">${x.progress.toFixed(1)}</td><td class="p-3">${x.points}</td></tr>`).join('') : `<tr><td colspan="9" class="p-8 text-center text-gray-400">${escapeHtml(translateText('leaderboard_empty'))}</td></tr>`}</tbody></table></div></div>`;
        modal.classList.remove('hidden');
    },
    openTrainerPortal() { this.renderAccessDashboard('coach'); },
    openParentPortal() { this.renderAccessDashboard('parent'); },
    openEntityPortal() { this.renderAccessDashboard('entity'); },
    openAccessPortal(role) { this.renderAccessDashboard(role); },
    renderAccessDashboard(role) {
        this.currentView = `portal:${role}`; const modal = document.getElementById('modal-container'); const content = document.getElementById('modal-content'); if (!modal || !content) return;
        const labels = { coach: { title: 'trainer_title', placeholder: 'lookup_placeholder', icon: 'fa-user-ninja', color: 'purple' }, parent: { title: 'parent_title', placeholder: 'lookup_placeholder', icon: 'fa-user-shield', color: 'emerald' }, entity: { title: 'role_entity', placeholder: 'entity_code_placeholder', icon: 'fa-building-columns', color: 'blue' } };
        const cfg = labels[role] || labels.coach;
        content.innerHTML = `<div class="space-y-6"><div class="text-center border-b border-white/10 pb-4"><h2 class="text-2xl font-black text-yellow-400"><i class="fas ${cfg.icon} text-${cfg.color}-400 ml-2"></i>${escapeHtml(translateText(cfg.title))}</h2><p class="text-xs text-gray-400 mt-2">${escapeHtml(translateText('portal_desc', 'The platform reveals the path; the coach shapes the path.'))}</p></div><div class="grid md:grid-cols-[1fr_auto] gap-3"><input id="role-account-code" class="input-field w-full text-center font-mono uppercase" placeholder="${escapeHtml(translateText(cfg.placeholder))}" autocomplete="off"><button onclick="DashboardManager.fetchMetrics('${role}')" class="btn-gold px-6 py-3 rounded-xl font-bold text-sm">${escapeHtml(translateText('follow_up', 'Open'))}</button></div><div class="text-center text-xs text-gray-500">${escapeHtml(translateText('enter_code', 'Enter your MIZAN access code. You can then choose from the Genius profiles authorized for your account.'))}</div><div id="metrics-view"></div></div>`;
        modal.classList.remove('hidden');
        const saved = JSON.parse(localStorage.getItem('mizan_account_profile') || 'null');
        if (saved?.role && ((role === 'entity' && saved.role === 'entity_manager') || saved.role === role) && saved.code) { const input = document.getElementById('role-account-code'); if (input) input.value = saved.code; }
    },
    async fetchMetrics(role) {
        const account = (document.getElementById('role-account-code')?.value || '').trim().toUpperCase(); const genius = (document.getElementById('role-genius-code')?.value || '').trim().toUpperCase(); const container = document.getElementById('metrics-view');
        if (!account) { if (container) container.innerHTML = `<div class="p-4 text-center text-red-300">${escapeHtml(translateText('enter_code', 'Enter your access code.'))}</div>`; return; }
        if (container) container.innerHTML = `<div class="p-6 text-center text-gray-400">${escapeHtml(translateText('loading_data'))}</div>`;
        try {
            const qs = new URLSearchParams({ role, account_code: account }); if (genius) qs.set('genius_code', genius);
            const res = await fetch(`api/role-dashboard.php?${qs.toString()}`, { credentials: 'same-origin', cache: 'no-store' });
            const data = await res.json(); if (!res.ok || !data.success) throw new Error(data.message || 'dashboard_failed');
            if (!genius) {
                const list = data.authorized_geniuses || []; if (!list.length) { container.innerHTML = `<div class="p-6 text-center bg-white/5 rounded-xl text-gray-300"><div class="text-3xl mb-2">🔐</div><div class="font-black">${escapeHtml(translateText('leaderboard_empty', 'No Genius profiles are currently assigned to this account.'))}</div><div class="text-xs text-gray-500 mt-2">${escapeHtml(translateText('portal_desc', 'Authorized relationships will appear here when they are activated.'))}</div></div>`; return; }
                container.innerHTML = `<div class="space-y-3 mt-5 pt-5 border-t border-white/10"><h3 class="font-black text-yellow-300">${escapeHtml(translateText('tracked_student', 'Authorized Genius profiles'))}</h3>${list.map(g => `<button type="button" onclick="document.getElementById('role-genius-code').value='${escapeHtml(g.genius_code || '')}'; DashboardManager.fetchMetrics('${role}')" class="w-full text-left rtl:text-right bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition"><div class="font-black text-yellow-200">${escapeHtml(g.full_name || '')}</div><div class="text-xs text-gray-400 mt-1">${escapeHtml(g.country || '')} · <span class="font-mono">${escapeHtml(g.genius_code || '')}</span></div></button>`).join('')}<input id="role-genius-code" type="hidden"></div>`; return;
            }
            const s = data.summary || {};
            container.innerHTML = `<div class="space-y-5 mt-5 pt-5 border-t border-white/10"><div class="bg-white/5 p-4 rounded-xl"><div class="font-black text-yellow-300">${escapeHtml(data.genius?.name || '')}</div><div class="text-xs text-gray-400">${escapeHtml(data.genius?.country || '')} · ${escapeHtml(data.genius?.genius_code || '')}</div></div><div class="grid grid-cols-2 md:grid-cols-4 gap-3"><div class="bg-black/30 p-4 rounded-xl text-center"><div class="text-xs text-gray-400">${escapeHtml(translateText('sessions_metric'))}</div><b>${s.sessions || 0}</b></div><div class="bg-black/30 p-4 rounded-xl text-center"><div class="text-xs text-gray-400">${escapeHtml(translateText('questions_metric'))}</div><b>${s.questions || 0}</b></div><div class="bg-black/30 p-4 rounded-xl text-center"><div class="text-xs text-gray-400">${escapeHtml(translateText('accuracy_metric'))}</div><b>${Number(s.average_accuracy || 0).toFixed(1)}%</b></div><div class="bg-black/30 p-4 rounded-xl text-center"><div class="text-xs text-gray-400">${escapeHtml(translateText('sessions_metric', 'Training days'))}</div><b>${s.training_days || 0}</b></div></div>${role === 'coach' && data.professional_analysis ? `<div class="bg-purple-500/10 border border-purple-400/20 rounded-xl p-4"><h3 class="font-black text-purple-200 mb-2">${escapeHtml(translateText('cognitive_profile_label', 'Professional analysis'))}</h3><p class="text-xs text-gray-300 mb-3">${escapeHtml(translateText('portal_desc', 'The platform provides evidence; the coach makes the educational decision.'))}</p><pre class="text-xs text-gray-300 whitespace-pre-wrap">${escapeHtml(JSON.stringify(data.professional_analysis, null, 2))}</pre></div>` : `<div class="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-4 text-sm text-emerald-100">${escapeHtml(data.support_message || translateText('portal_desc', 'Follow progress, encourage practice, and discuss interpretation with the coach.'))}</div>`}</div>`;
        } catch (e) { container.innerHTML = `<div class="p-6 text-center text-red-300">${escapeHtml(e.message || translateText('student_not_found'))}</div>`; }
    },
    async openMonthlyGeniuses() {
        this.currentView = 'monthly-geniuses'; const modal = document.getElementById('modal-container'), content = document.getElementById('modal-content'); if (!modal || !content) return;
        content.innerHTML = `<div class="p-8 text-center text-gray-400">${escapeHtml(translateText('loading_data'))}</div>`; modal.classList.remove('hidden');
        try { const res = await fetch('api/monthly-geniuses.php?limit=12', { credentials: 'same-origin', cache: 'no-store' }); const data = await res.json(); if (!res.ok || !data.success) throw new Error(data.message || 'monthly_failed');
        content.innerHTML = `<div class="space-y-6"><div class="text-center border-b border-white/10 pb-4"><h2 class="text-2xl font-black text-yellow-400"><i class="fas fa-crown ml-2"></i>${escapeHtml(translateText('monthly_title', 'Mizan Genius of the Month'))}</h2><p class="text-xs text-gray-400">${escapeHtml(data.month_label || '')}</p></div><div class="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-4 text-sm text-gray-200">${data.official ? escapeHtml(translateText('monthly_description', 'Official calculation based on published eligibility and MGI criteria.')) : escapeHtml(translateText('monthly_description', 'Provisional only: the minimum competitor threshold has not been met.'))}</div><div class="grid md:grid-cols-5 gap-2 text-center">${[['accuracy', 30], ['consistency', 20], ['speed', 15], ['progress', 10], ['points', 25]].map(x => `<div class="bg-white/5 rounded-xl p-3"><div class="text-xs text-gray-400">${escapeHtml(translateText('leaderboard_' + x[0], x[0]))}</div><div class="font-black text-yellow-300">${x[1]}%</div></div>`).join('')}</div><div class="grid gap-3">${(data.data || []).map((x, i) => `<div class="flex items-center gap-4 p-4 rounded-2xl border ${i === 0 ? 'border-yellow-400/50 bg-yellow-500/10' : 'border-white/10 bg-white/5'}"><div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-yellow-300">${i + 1}</div><div class="flex-1 min-w-0"><div class="font-black text-white truncate">${escapeHtml(x.name || '')}</div><div class="text-xs text-gray-400">${escapeHtml(x.country || '')} · ${escapeHtml(x.genius_code || '')}</div></div><div class="text-right"><div class="font-black text-yellow-300">MGI ${Number(x.mgi || 0).toFixed(2)}</div><div class="text-[10px] text-gray-400">${Number(x.accuracy || 0).toFixed(1)}% · ${Number(x.sessions || 0)} ${escapeHtml(translateText('sessions_metric'))}</div></div></div>`).join('') || `<div class="p-8 text-center text-gray-400">${escapeHtml(translateText('leaderboard_empty'))}</div>`}</div><div class="bg-white/5 rounded-xl p-4"><h3 class="font-black text-yellow-300 mb-2">${escapeHtml(translateText('monthly_title', 'Monthly distinctions'))}</h3><div class="grid md:grid-cols-2 gap-2">${(data.awards || []).map(a => `<div class="p-3 rounded-lg border border-white/10"><div class="text-xs text-gray-400">${escapeHtml(a.label)}</div><div class="font-bold">${escapeHtml(a.name || '')} · ${Number(a.score || 0).toFixed(2)}</div></div>`).join('')}</div></div></div>`;
        } catch (e) { content.innerHTML = `<div class="p-8 text-center text-red-300">${escapeHtml(e.message || translateText('monthly_failed'))}</div>`; }
    },
};

function registrationText() {
    const t = (key, fallback = '') => translateText(key, fallback);
    const lang = (typeof getActiveLanguage === 'function' ? getActiveLanguage() : 'ar').split('-')[0];
    const geniusLabel = t('genius_full_name_label', t('fullname_label', lang === 'ar' ? 'الاسم الكامل' : 'Full name'));
    const geniusPlaceholder = t('genius_full_name_placeholder', t('fullname_ph', lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'));
    const entityContactFallback = lang === 'ar' ? 'اسم المدير / المفوض / المسؤول التنفيذي' : lang === 'fr' ? 'Nom du directeur / représentant autorisé / responsable exécutif' : 'Name of Director / Authorized Representative / Executive';
    const entityContactPhFallback = lang === 'ar' ? 'أدخل اسم المدير أو المفوض أو المسؤول التنفيذي' : lang === 'fr' ? 'Saisissez le nom du directeur ou représentant autorisé' : 'Enter the director or authorized representative name';
    const continueLabels = { genius: lang === 'ar' ? 'متابعة العبقري' : lang === 'fr' ? 'Continuer avec le génie' : 'Continue to Genius', coach: lang === 'ar' ? 'متابعة المدرب' : lang === 'fr' ? 'Continuer avec le coach' : 'Continue to Coach', parent: lang === 'ar' ? 'متابعة ولي الأمر' : lang === 'fr' ? 'Continuer avec le parent' : 'Continue to Parent', entity: lang === 'ar' ? 'متابعة المؤسسة' : lang === 'fr' ? 'Continuer avec l’institution' : 'Continue to Institution' };
    return {
        geniusName: geniusLabel, geniusPh: geniusPlaceholder,
        coachName: `${t('role_coach', lang === 'ar' ? 'مدرب' : lang === 'fr' ? 'Coach' : 'Coach')} — ${geniusLabel}`, coachPh: geniusPlaceholder,
        parentName: `${t('role_parent', lang === 'ar' ? 'ولي الأمر' : lang === 'fr' ? 'Parent' : 'Parent')} — ${geniusLabel}`, parentPh: geniusPlaceholder,
        entityContact: t('authorized_representative_label', entityContactFallback), entityContactPh: t('authorized_representative_placeholder', entityContactPhFallback),
        entityIntl: t('authorized_representative_intl_label', t('display_name_en_label', lang === 'ar' ? 'الاسم الدولي باللغة الإنجليزية' : 'International name')), entityIntlPh: t('authorized_representative_intl_placeholder', t('display_name_en_placeholder', lang === 'ar' ? 'أدخل الاسم الدولي باللغة الإنجليزية' : 'Enter the international name')),
        geniusNote: t('genius_registration_note', t('role_genius_desc', lang === 'ar' ? 'أنشئ هويتك الآمنة في ميزان أنزان.' : 'Create your secure Genius identity.')),
        coachNote: t('coach_registration_note', t('coach_registration_desc', lang === 'ar' ? 'أنشئ حسابك المهني كمدرب في ميزان أنزان.' : 'Create your professional Coach account.')),
        parentNote: t('parent_registration_note', t('parent_registration_desc', lang === 'ar' ? 'أنشئ حسابك الآمن كولي أمر.' : 'Create your secure Parent account.')),
        entityNote: t('entity_registration_note', t('role_entity_desc', lang === 'ar' ? 'أنشئ الهوية الرسمية لمؤسستك.' : 'Create the official organization identity.')),
        coachModeLabel: t('coach_registration_mode_label', lang === 'ar' ? 'طريقة تسجيل المدرب' : lang === 'fr' ? 'Mode d’inscription du coach' : 'Coach registration mode'),
        coachIndependent: t('coach_independent_option', lang === 'ar' ? 'مدرب مستقل' : lang === 'fr' ? 'Coach indépendant' : 'Independent Coach'),
        coachInstitution: t('coach_institution_option', lang === 'ar' ? 'عضو في مؤسسة' : lang === 'fr' ? 'Membre d’une institution' : 'Institution Member'),
        institutionCodeLabel: t('institution_code_label', lang === 'ar' ? 'كود المؤسسة' : lang === 'fr' ? 'Code de l’institution' : 'Institution Code'),
        institutionCodePlaceholder: t('institution_code_placeholder', lang === 'ar' ? 'أدخل كود المؤسسة الذي حصلت عليه' : lang === 'fr' ? 'Saisissez le code de l’institution' : 'Enter the institution code'),
        institutionCodeHelp: t('institution_code_help', lang === 'ar' ? 'استخدم كود المؤسسة الرسمي للانضمام إليها كمدرب.' : lang === 'fr' ? 'Utilisez le code officiel de l’institution pour la rejoindre comme coach.' : 'Use the official institution code to join as a coach.'),
        createAccount: { genius: t('create_genius_account_button', lang === 'ar' ? 'إنشاء حساب العبقري' : 'Create Genius Account'), coach: t('create_coach_account_button', lang === 'ar' ? 'إنشاء حساب المدرب' : 'Create Coach Account'), parent: t('create_parent_account_button', lang === 'ar' ? 'إنشاء حساب ولي الأمر' : 'Create Parent Account'), entity: t('create_organization_account_button', lang === 'ar' ? 'إنشاء حساب المؤسسة' : 'Create Organization Account') },
        continueAccount: continueLabels,
        success: t('registration_success_desc', lang === 'ar' ? 'تم إنشاء حساب ميزان أنزان الخاص بك بنجاح.' : 'Your MIZAN ANZAN account was created successfully.'),
        migration: t('server_error', t('server_error', lang === 'ar' ? 'خدمة التسجيل غير جاهزة حاليًا.' : 'The registration service is not ready.')),
        failed: t('registration_failed', t('server_error', lang === 'ar' ? 'تعذر إكمال التسجيل.' : 'Registration could not be completed.'))
    };
}

function setRegistrationRole(role) {
    const allowed = ['genius', 'coach', 'parent', 'entity']; if (!allowed.includes(role)) role = 'genius';
    const text = registrationText(); const roleEl = document.getElementById('registration-role');
    const entityTypeWrap = document.getElementById('entity-type-wrap'); const coachModeWrap = document.getElementById('coach-registration-mode-wrap'); const coachInstitutionWrap = document.getElementById('coach-institution-wrap'); const coachInstitutionCodeInput = document.getElementById('reg-institution-code');
    const entityNameWrap = document.getElementById('entity-name-wrap'); const entityContactWrap = document.getElementById('entity-contact-wrap'); const personNameWrap = document.getElementById('person-name-wrap');
    const personNameLabel = document.getElementById('person-name-label'); const personNameInput = document.getElementById('reg-fullname'); const entityContactLabel = document.getElementById('entity-contact-label');
    const entityContactInput = document.getElementById('reg-entity-contact'); const displayNameLabel = document.getElementById('display-name-en-label'); const displayNameInput = document.getElementById('reg-display-name-en');
    const entityNameInput = document.getElementById('reg-entity-name'); const note = document.getElementById('registration-note'); const submitButton = document.getElementById('registration-submit'); const submit = submitButton?.querySelector('span');
    if (roleEl) roleEl.value = role;
    if (submitButton) { submitButton.classList.remove('hidden'); submitButton.removeAttribute('aria-hidden'); submitButton.disabled = false; }
    const isEntity = role === 'entity'; const isCoach = role === 'coach';
    coachModeWrap?.classList.toggle('hidden', !isCoach);
    if (isCoach && !window.mizanCoachRegistrationMode) window.mizanCoachRegistrationMode = 'independent';
    if (!isCoach) { window.mizanCoachRegistrationMode = 'independent'; coachInstitutionWrap?.classList.add('hidden'); if (coachInstitutionCodeInput) { coachInstitutionCodeInput.value = ''; coachInstitutionCodeInput.required = false; } }
    entityTypeWrap?.classList.toggle('hidden', !isEntity); entityNameWrap?.classList.toggle('hidden', !isEntity); entityContactWrap?.classList.toggle('hidden', !isEntity);
    personNameWrap?.classList.toggle('hidden', isEntity);
    if (isEntity) {
        if (personNameInput) personNameInput.required = false;
        if (entityContactInput) entityContactInput.required = true;
        if (entityNameInput) entityNameInput.required = true;
        if (entityContactLabel) entityContactLabel.textContent = text.entityContact;
        if (entityContactInput) entityContactInput.placeholder = text.entityContactPh;
        if (displayNameLabel) displayNameLabel.textContent = text.entityIntl;
        if (displayNameInput) displayNameInput.placeholder = text.entityIntlPh;
    } else {
        if (personNameInput) personNameInput.required = true;
        if (entityContactInput) entityContactInput.required = false;
        if (entityNameInput) entityNameInput.required = false;
        const labels = { genius: [text.geniusName, text.geniusPh], coach: [text.coachName, text.coachPh], parent: [text.parentName, text.parentPh] };
        const pair = labels[role] || labels.genius;
        if (personNameLabel) personNameLabel.textContent = pair[0];
        if (personNameInput) personNameInput.placeholder = pair[1];
        if (displayNameLabel) displayNameLabel.textContent = translateText('display_name_en_label', 'International / English name (optional)');
        if (displayNameInput) displayNameInput.placeholder = translateText('display_name_en_placeholder', 'Optional English / international name');
    }
    const buttons = { genius: 'create_genius_account_button', coach: 'create_coach_account_button', parent: 'create_parent_account_button', entity: 'create_organization_account_button' };
    const buttonFallbacks = { ar: { genius: 'إنشاء حساب العبقري', coach: 'إنشاء حساب المدرب', parent: 'إنشاء حساب ولي الأمر', entity: 'إنشاء حساب المؤسسة' }, en: { genius: 'Create Genius Account', coach: 'Create Coach Account', parent: 'Create Parent Account', entity: 'Create Organization Account' }, fr: { genius: 'Créer le compte du génie', coach: 'Créer le compte du coach', parent: 'Créer le compte du parent', entity: 'Créer le compte de l’organisation' } };
    const currentLang = (typeof getActiveLanguage === 'function' ? getActiveLanguage() : 'ar').split('-')[0];
    const fallbackButtons = buttonFallbacks[currentLang] || buttonFallbacks.en;
    if (submit) submit.textContent = translateText(buttons[role] || buttons.genius, fallbackButtons[role] || fallbackButtons.genius);
    const notes = { genius: text.geniusNote, coach: text.coachNote, parent: text.parentNote, entity: text.entityNote };
    if (note) note.textContent = notes[role] || text.geniusNote;
}

function setCoachRegistrationMode(mode) {
    if (!['independent', 'institution'].includes(mode)) mode = 'independent';
    window.mizanCoachRegistrationMode = mode;
    const wrap = document.getElementById('coach-institution-wrap'); const codeInput = document.getElementById('reg-institution-code');
    const independentBtn = document.getElementById('coach-mode-independent'); const institutionBtn = document.getElementById('coach-mode-institution');
    const isInstitution = mode === 'institution';
    wrap?.classList.toggle('hidden', !isInstitution); if (codeInput) codeInput.required = isInstitution;
    independentBtn?.classList.toggle('ring-2', !isInstitution); institutionBtn?.classList.toggle('ring-2', isInstitution);
    const text = registrationText();
    const label = document.querySelector('#coach-registration-mode-wrap > label'); const codeLabel = document.querySelector('#coach-institution-wrap > label'); const codeHelp = document.querySelector('#coach-institution-wrap p');
    if (label) label.textContent = text.coachModeLabel; if (independentBtn) independentBtn.textContent = '👤 ' + text.coachIndependent; if (institutionBtn) institutionBtn.textContent = '🏛️ ' + text.coachInstitution;
    if (codeLabel) codeLabel.textContent = text.institutionCodeLabel; if (codeInput) codeInput.placeholder = text.institutionCodePlaceholder; if (codeHelp) codeHelp.textContent = text.institutionCodeHelp;
}

// 🔥 الدالة الرئيسية لتسجيل الأدوار (مدرب، ولي أمر، مؤسسة)
async function handleRegistrationSubmit() {
    const role = document.getElementById('registration-role')?.value || 'genius';
    if (role === 'genius') { await registerFirstTimeStudent(); return; }
    const personName = document.getElementById('reg-fullname')?.value.trim() || '';
    const entityName = document.getElementById('reg-entity-name')?.value.trim() || '';
    const entityContact = document.getElementById('reg-entity-contact')?.value.trim() || '';
    const fullName = role === 'entity' ? entityContact : personName;
    const countryCode = String(document.getElementById('reg-country')?.value || '').trim().toUpperCase();
    const displayNameEn = document.getElementById('reg-display-name-en')?.value.trim() || '';
    const entityType = document.getElementById('reg-entity-type')?.value || 'organization';
    const coachRegistrationMode = role === 'coach' ? (window.mizanCoachRegistrationMode || 'independent') : 'independent';
    const institutionCode = role === 'coach' && coachRegistrationMode === 'institution' ? String(document.getElementById('reg-institution-code')?.value || '').trim().toUpperCase() : '';
    const button = document.getElementById('registration-submit'); const result = document.getElementById('registration-result');
    if (!fullName || !countryCode || !window.MizanCountry?.ISO_CODES?.includes(countryCode) || (role === 'entity' && !entityName) || (role === 'coach' && coachRegistrationMode === 'institution' && !institutionCode)) {
        if (result) { result.className = 'p-4 rounded-xl bg-red-500/10 border border-red-400/20 text-red-200 text-sm'; result.textContent = translateText('required_field', 'يرجى إكمال الحقول المطلوبة واختيار الدولة من القائمة الرسمية.'); result.classList.remove('hidden'); } return;
    }
    if (button) button.disabled = true;
    if (result) { result.className = 'p-4 rounded-xl bg-white/5 text-gray-300 text-sm'; result.textContent = translateText('loading_data', 'جارٍ إنشاء هويتك الآمنة في ميزان أنزان...'); result.classList.remove('hidden'); }
    try {
        const response = await fetch('api/register-account.php', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'same-origin', cache: 'no-store', body: JSON.stringify({ type: role, full_name: fullName, entity_name: entityName, display_name_en: displayNameEn, manager_display_name_en: role === 'entity' ? displayNameEn : '', manager_full_name: role === 'entity' ? entityContact : '', country_code: countryCode, entity_type: entityType, coach_registration_mode: coachRegistrationMode, institution_code: institutionCode }) });
        const raw = await response.text(); let data = {}; try { data = raw ? JSON.parse(raw) : {}; } catch (_) { data = { message: raw.slice(0, 240), error_code: 'REGISTRATION_NON_JSON_RESPONSE' }; }
        if (!response.ok || !data.success || !data.account?.code) { const error = new Error(data.message || `Registration failed (HTTP ${response.status})`); error.code = data.error_code || `HTTP_${response.status}`; error.httpStatus = response.status; error.serverData = data; throw error; }
        const account = { id: Number(data.account.id || 0), code: data.account.code, role: data.account.role || role, scope: data.account.scope || (role === 'entity' ? 'entity' : (role === 'coach' && coachRegistrationMode === 'institution' ? 'institution' : 'independent')), countryCode, entityId: Number(data.entity?.id || data.account.entity_id || 0), entityCode: data.entity?.code || '' };
        localStorage.setItem('mizan_account_profile', JSON.stringify(account));
        const lang = (typeof getActiveLanguage === 'function' ? getActiveLanguage() : 'ar').split('-')[0];
        const roleNames = { ar: { coach: 'مدرب', parent: 'ولي الأمر', entity: 'مؤسسة' }, en: { coach: 'Coach', parent: 'Parent', entity: 'Organization' }, fr: { coach: 'Coach', parent: 'Parent', entity: 'Organisation' } };
        const currentRoleNames = roleNames[lang] || roleNames.en; const roleLabel = currentRoleNames[role] || role;
        const successTitle = { ar: { coach: 'تم إنشاء حساب المدرب بنجاح.', parent: 'تم إنشاء حساب ولي الأمر بنجاح.', entity: 'تم إنشاء حساب المؤسسة بنجاح.' }, en: { coach: 'Coach account created successfully.', parent: 'Parent account created successfully.', entity: 'Organization account created successfully.' }, fr: { coach: 'Le compte du coach a été créé avec succès.', parent: 'Le compte du parent a été créé avec succès.', entity: 'Le compte de l’organisation a été créé avec succès.' } };
        const saveWarning = { ar: 'يرجى حفظ كودك بأمان. ستحتاج إليه للوصول إلى حسابك في ميزان أنزان.', en: 'Please keep your code safe. You will need it to access your MIZAN ANZAN account.', fr: 'Veuillez conserver votre code en lieu sûr. Vous en aurez besoin pour accéder à votre compte MIZAN ANZAN.' };
        
        // 🔥 النصوص الجديدة حسب الدور (بدلاً من "إنشاء الحساب")
        const dashboardLabels = {
            ar: { coach: 'لوحة تحكم المدرب', parent: 'لوحة متابعة ولي الأمر', entity: 'لوحة متابعة وتحكم المؤسسة' },
            en: { coach: 'Coach Dashboard', parent: 'Parent Dashboard', entity: 'Organization Dashboard' },
            fr: { coach: 'Tableau de bord du coach', parent: 'Tableau de bord du parent', entity: 'Tableau de bord de l\'organisation' }
        };
        const dashboardLabel = dashboardLabels[lang]?.[role] || dashboardLabels.en[role] || 'Dashboard';

        const successMessage = successTitle[lang]?.[role] || successTitle.en[role] || 'Account created successfully.';
        const warningMessage = saveWarning[lang] || saveWarning.en;
        const entityCode = data.entity?.code ? `<div class="mt-3 text-xs text-blue-200">${escapeHtml(translateText('entity_code_label', lang === 'ar' ? 'كود المؤسسة' : lang === 'fr' ? 'Code de l’organisation' : 'Institution Code'))}: <strong class="font-mono">${escapeHtml(data.entity.code)}</strong></div>` : '';
        
        // 🔥 بناء واجهة نجاح مشابهة لواجهة العبقري ولكن مع زر اللوحة المناسب
        if (result) {
            // إزالة أي محتوى سابق
            result.className = 'p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-100 text-sm';
            // إنشاء محتوى جديد يشبه واجهة العبقري
            result.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
                    <div style="width:60px;height:60px;border-radius:50%;background:rgba(16,185,129,.15);border:1px solid rgba(52,211,153,.4);display:flex;align-items:center;justify-content:center;font-size:32px;color:#6ee7b7;">✓</div>
                    <div class="text-green-300 font-black text-lg">${escapeHtml(successMessage)}</div>
                    <div class="text-xs text-gray-300 font-bold">${escapeHtml(roleLabel)}</div>
                    <div class="text-xs text-gray-300">${escapeHtml(warningMessage)}</div>
                    <div class="mt-2 bg-black/50 border border-yellow-500/30 rounded-xl p-4 font-mono text-2xl text-yellow-300 select-all" dir="ltr">${escapeHtml(account.code)}</div>
                    ${entityCode}
                    <button type="button" id="registration-open-dashboard" class="mt-3 w-full bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl py-3 font-black transition">${escapeHtml(dashboardLabel)}</button>
                </div>
            `;
            // ربط الزر بفتح اللوحة المناسبة
            document.getElementById('registration-open-dashboard')?.addEventListener('click', () => {
                document.getElementById('onboarding-modal')?.classList.add('hidden');
                if (typeof DashboardManager !== 'undefined' && typeof DashboardManager.openAccessPortal === 'function') {
                    DashboardManager.openAccessPortal(role === 'entity' ? 'entity' : role);
                } else {
                    console.warn('[MIZAN] DashboardManager.openAccessPortal is unavailable.');
                }
            });
        }
    } catch (error) {
        console.error('[MIZAN] Account registration failed:', error);
        if (result) {
            result.className = 'p-4 rounded-xl bg-red-500/10 border border-red-400/20 text-red-200 text-sm';
            const knownMessages = { MIGRATION_005_REQUIRED: translateText('server_error', 'خدمة التسجيل تحتاج إلى إصلاح قاعدة البيانات.'), REGISTRATION_SERVICE_UNAVAILABLE: translateText('server_error', 'خدمة التسجيل غير متاحة حاليًا.'), REGISTRATION_SCHEMA_NOT_READY: translateText('server_error', 'بنية التسجيل غير جاهزة.'), REGISTRATION_SCHEMA_MISMATCH: translateText('server_error', 'هناك اختلاف في بنية قاعدة البيانات.'), REGISTRATION_DB_INSERT_FAILED: translateText('server_error', 'تعذر حفظ الحساب في قاعدة البيانات.'), REGISTRATION_DUPLICATE: translateText('code_already_used', 'بيانات التسجيل مستخدمة مسبقًا.'), REGISTRATION_INVALID_ORIGIN: translateText('server_error', 'مصدر الطلب غير صالح.'), REGISTRATION_SCHEMA_BOOTSTRAP_FAILED: translateText('server_error', 'تعذر تجهيز بنية التسجيل.'), REGISTRATION_PHP_FATAL: translateText('server_error', 'حدث خطأ داخلي في الخادم.'), REGISTRATION_NON_JSON_RESPONSE: translateText('server_error', 'تعذر الاتصال بخدمة التسجيل.'), REGISTRATION_INVALID_ROLE: translateText('role_required', 'يرجى اختيار نوع الحساب.'), REGISTRATION_INVALID_NAME: translateText('invalid_name', 'يرجى إدخال اسم صالح.'), REGISTRATION_INVALID_ENTITY: translateText('entity_required', 'يرجى إدخال معلومات المؤسسة.'), REGISTRATION_INVALID_COUNTRY: translateText('country_required', 'يرجى اختيار الدولة.'), REGISTRATION_INVALID_INTL_NAME: translateText('invalid_english_name', 'يرجى إدخال اسم دولي صالح باللغة الإنجليزية.'), REGISTRATION_INVALID_MANAGER_INTL_NAME: translateText('invalid_english_name', 'يرجى إدخال اسم دولي صالح باللغة الإنجليزية.'), PROFILE_SCHEMA_INCOMPLETE: translateText('server_error', 'بنية قاعدة بيانات الحساب غير مكتملة.'), PROFILE_TABLE_MISSING: translateText('server_error', 'قاعدة بيانات الحساب غير جاهزة.'), INVALID_NAME: translateText('invalid_name', 'يرجى إدخال اسم صالح.'), INVALID_COUNTRY: translateText('country_required', 'يرجى اختيار الدولة.'), REGISTRATION_DB_WRITE_FAILED: translateText('server_error', 'تعذر حفظ الحساب على الخادم.') };
            result.textContent = knownMessages[error.code] || error.message || translateText('registration_failed', 'تعذر إكمال التسجيل.'); result.classList.remove('hidden');
        }
    } finally {
        if (button) {
            const successVisible = result && result.classList.contains('bg-emerald-500/10');
            if (successVisible) { button.disabled = true; button.classList.add('hidden'); button.setAttribute('aria-hidden', 'true'); }
            else { button.disabled = false; button.classList.remove('hidden'); button.removeAttribute('aria-hidden'); }
        }
    }
}

window.addEventListener('mizanLanguageChanged', () => {
    const currentRole = document.getElementById('registration-role')?.value || 'genius';
    setRegistrationRole(currentRole);
    if (currentRole === 'coach') setCoachRegistrationMode(window.mizanCoachRegistrationMode || 'independent');
});

// شريط التقدم الجانبي
function initScrollProgress() {
    const fill = document.getElementById('scroll-progress-fill');
    const dot = document.getElementById('scroll-progress-dot');
    if (!fill) {
        console.warn('عنصر شريط التقدم غير موجود في الصفحة');
        return;
    }

    function update() {
        const scrollTop = window.scrollY || window.pageYOffset || 0;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
        fill.style.height = pct + '%';
        if (dot) {
            dot.style.top = `calc(${pct}% - 6px)`;
        }
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    // تحديث أولي
    update();
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initScrollProgress();
});

// تشغيل أيضاً بعد تحميل الصور والمحتوى الديناميكي
window.addEventListener('load', function() {
    initScrollProgress();
});

// ============================================================
// إزالة أي مراقب يخفي الأزرار (لم نعد بحاجة إليه)
// ============================================================

// إعادة تعريف registerFirstTimeStudent (ضمان عمل واجهة العبقري)
async function registerFirstTimeStudent() {
    const fullName = document.getElementById('reg-fullname')?.value.trim() || '';
    const countryCode = String(document.getElementById('reg-country')?.value || '').trim().toUpperCase();
    const button = document.querySelector('#onboarding-modal form button[type="submit"]');
    const result = document.getElementById('registration-result');

    if (!fullName || !countryCode) {
        if (result) result.textContent = "يرجى اختيار الدولة وإدخال الاسم.";
        return;
    }

    if (button) { button.disabled = true; button.textContent = '...'; }

    try {
        const response = await fetch('api/register-student.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
            body: JSON.stringify({ full_name: fullName, country_code: countryCode })
        });
        const data = await response.json();
        
        if (!response.ok || !data.success || !data.student?.code) {
            throw new Error(data.message || 'فشل التسجيل');
        }

        if (typeof showGeniusRegistrationSuccess === 'function') {
            showGeniusRegistrationSuccess(data.student);
        } else {
            alert("تم التسجيل بنجاح! الرمز: " + data.student.code);
        }

    } catch (error) {
        console.error(error);
        if (result) result.textContent = error.message;
    } finally {
        if (button) { button.disabled = false; button.textContent = 'إنشاء كود العبقري والدخول'; }
    }
}

window.AppState = AppState;
window.GameEngine = GameEngine;
window.DashboardManager = DashboardManager;
window.applyStandardPreset = applyStandardPreset;
window.updateSpeedDisplay = updateSpeedDisplay;
window.toggleSidebar = toggleSidebar;
window.switchView = switchView;
window.openRegistrationModal = openRegistrationModal;
window.registerFirstTimeStudent = registerFirstTimeStudent;
window.setRegistrationRole = setRegistrationRole;
window.setCoachRegistrationMode = setCoachRegistrationMode;
window.handleRegistrationSubmit = handleRegistrationSubmit;
window.sortLeaderboard = sortLeaderboard;
window.repositionSidebar = repositionSidebar;
window.refreshDynamicTranslations = refreshDynamicTranslations;