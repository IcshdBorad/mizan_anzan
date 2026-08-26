/**
 * محرك منصة ميزان أنزان للتدريب الفائق والأولمبياد
 */
class MizanAnzanEngine {
    constructor(config = {}) {
        this.digits = config.digits || 4;     // عدد الخانات (يدعم حتى 15)
        this.rows = config.rows || 10;         // عدد الصفوف (يدعم حتى 100)
        this.allowNegative = config.allowNegative || false;
    }

    /**
     * توليد مصفوفة الأرقام بناءً على القواعد المتقدمة
     */
    generateOlympiadRows() {
        if (this.digits > 15) this.digits = 15;
        if (this.rows > 100) this.rows = 100;

        const minVal = Math.pow(10, this.digits - 1);
        const maxVal = Math.pow(10, this.digits) - 1;
        
        let numbers = [];
        let currentSum = 0;

        for (let i = 0; i < this.rows; i++) {
            let num = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
            
            if (!this.allowNegative && currentSum + num < 0) {
                num = Math.abs(num);
            }
            
            numbers.push(num);
            currentSum += num;
        }

        return {
            numbers: numbers,
            totalSum: currentSum
        };
    }

    /**
     * تشغيل العد التنازلي البصري والصوتي 3-2-1 قبل بدء التمرين
     */
    startCountdown(onCompleteCallback) {
        let count = 3;
        let overlay = document.getElementById('anzan-countdown-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'anzan-countdown-overlay';
            document.body.appendChild(overlay);
        }
        
        overlay.style.display = 'flex';
        overlay.innerText = count;
        this.playTone(440, 150); // نغمة العد

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                overlay.innerText = count;
                this.playTone(440, 150);
            } else if (count === 0) {
                overlay.innerText = 'انطلق!';
                this.playTone(880, 300); // نغمة الانطلاق الحماسية
            } else {
                clearInterval(timer);
                overlay.style.display = 'none';
                if (typeof onCompleteCallback === 'function') {
                    onCompleteCallback();
                }
            }
        }, 1000);
    }

    /**
     * توليد مؤثرات صوتية تفاعلية دون الحاجة لملفات خارجية
     */
    playTone(frequency, duration) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = frequency;
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            setTimeout(() => {
                osc.stop();
                ctx.close();
            }, duration);
        } catch (e) {
            console.warn('Audio Context blocked or not supported.');
        }
    }
}

// مثال عملي للاستخدام والتشغيل الفوري:
// const anzanCore = new MizanAnzanEngine({ digits: 5, rows: 20 });
// anzanCore.startCountdown(() => {
//     console.log(anzanCore.generateOlympiadRows());
// });