/**
 * فاحص الانتقالات المركبة ومتعددة الخانات
 */
class SorobanTransitionValidator {
    /**
     * التحقق من صحة انتقال كامل بين رقمين وفق مستوى القاعدة
     * @param {number} fromNum 
     * @param {number} toNum 
     * @param {string} level 
     * @returns {{ valid: boolean, reason?: string }}
     */
    static validateTransition(fromNum, toNum, level) {
        if (fromNum < 0 || toNum < 0) {
            return { valid: false, reason: "الأعداد السالبة غير مدعومة على السوروبان القياسي." };
        }

        const delta = toNum - fromNum;
        if (delta === 0) return { valid: true };

        const fromDigits = String(fromNum).padStart(10, '0').split('').map(Number);
        const toDigits = String(toNum).padStart(10, '0').split('').map(Number);

        let carry = 0;
        // الفحص من اليمين إلى اليسار (من الآحاد إلى الخانات الأعلى)
        for (let i = 9; i >= 0; i--) {
            const dFrom = fromDigits[i];
            const dTo = toDigits[i];
            let stepDelta = dTo - dFrom - carry;

            if (stepDelta < -9 || stepDelta > 9) {
                // ضبط الحمل في حال تجاوز الخانة
                if (stepDelta < 0) {
                    stepDelta += 10;
                    carry = 1;
                } else {
                    stepDelta -= 10;
                    carry = -1;
                }
            } else {
                carry = 0;
            }

            if (stepDelta !== 0) {
                const isValidStep = SorobanBeadEngine.validateSingleDigitOp(dFrom, stepDelta, level);
                if (!isValidStep) {
                    return {
                        valid: false,
                        reason: `العملية غير مسموحة في المستوى ${level} عند الخانة رقم ${10 - i} (من ${dFrom} إلى ${dTo}).`
                    };
                }
            }
        }

        return { valid: true };
    }
}

if (typeof module !== 'undefined') {
    module.exports = SorobanTransitionValidator;
}