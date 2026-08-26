/**
 * محرك السوروبان الصارم - الإصدار القياسي v3.0
 * المطور لصالح منصة ميزان أنزان (الهيئة الدولية - فرنسا)
 */
class SorobanBeadEngine {
    // مستويات القواعد المعتمدة
    static LEVELS = {
        L1: 'L1_DIRECT',       // الجمع والطرح المباشر
        L2: 'L2_FRIENDS_5',    // أصدقاء 5 (مكملات العدد 5)
        L3: 'L3_FRIENDS_10',   // أصدقاء 10 (مكملات العدد 10)
        LM: 'LM_MIXED'         // القواعد المركبة / الخليط الشامل
    };

    /**
     * استخراج حالة الخرزات لرقم محدد (0 - 9)
     * @param {number} digit 
     * @returns {{ upper: boolean, lower: number }}
     */
    static getBeadState(digit) {
        if (digit < 0 || digit > 9) {
            throw new Error(`الرقم ${digit} خارج نطاق الخانة الواحدة (0-9).`);
        }
        return {
            upper: digit >= 5, // الخرزة الخماسية (العليا)
            lower: digit % 5   // عدد الخرزات الأحادية (السفلى)
        };
    }

    /**
     * التحقق من قاعدة L1: الجمع والطرح المباشر
     */
    static isL1DirectAddition(curDigit, addDigit) {
        if (curDigit + addDigit > 9) return false;
        const cur = this.getBeadState(curDigit);
        const add = this.getBeadState(addDigit);

        // إضافة خرزة خماسية فقط إذا كانت غير مفعلة
        if (add.upper && cur.upper) return false;
        // إضافة خرزات سفلى فقط إذا كان هناك متسع
        return (cur.lower + add.lower) <= 4;
    }

    static isL1DirectSubtraction(curDigit, subDigit) {
        if (curDigit < subDigit) return false;
        const cur = this.getBeadState(curDigit);
        const sub = this.getBeadState(subDigit);

        if (sub.upper && !cur.upper) return false;
        return cur.lower >= sub.lower;
    }

    /**
     * التحقق من قاعدة L2: أصدقاء 5 (مكملات العدد 5)
     */
    static isL2Complex5Addition(curDigit, addDigit) {
        if (addDigit < 1 || addDigit > 4) return false;
        if (this.isL1DirectAddition(curDigit, addDigit)) return false;

        const cur = this.getBeadState(curDigit);
        // التنشيط يتطلب إضافة 5 وطرح المكمل (5 - addDigit)
        const complement = 5 - addDigit;
        
        // يجب أن تكون الخرزة العليا فارغة والخرزات السفلى تكفي لطرح المكمل
        return !cur.upper && cur.lower >= complement;
    }

    static isL2Complex5Subtraction(curDigit, subDigit) {
        if (subDigit < 1 || subDigit > 4) return false;
        if (this.isL1DirectSubtraction(curDigit, subDigit)) return false;

        const cur = this.getBeadState(curDigit);
        // التلغاء يتطلب طرح 5 وإضافة المكمل (5 - subDigit)
        const complement = 5 - subDigit;

        // يجب أن تكون الخرزة العليا مفعلة وهناك متسع لإضافة المكمل في السفلى
        return cur.upper && (cur.lower + complement <= 4);
    }

    /**
     * التحقق من قاعدة L3: أصدقاء 10 (مكملات العدد 10) - تم التصحيح بالكامل
     */
    static isL3Complex10Addition(curDigit, addDigit) {
        if (curDigit + addDigit < 10) return false; // ليست عملية ترحيل عشرات
        
        const complement = 10 - addDigit; // الرقم المكمل للعدد 10
        
        // إضافة الرقم تتطلب: رحل 1 للخانة التالية، واطرح المكمل من الخانة الحالية
        // الطرح يجب أن يكون ممكناً إما مباشرة (L1) أو عبر أصدقاء 5 (L2)
        const canSubtractComplementDirect = this.isL1DirectSubtraction(curDigit, complement);
        const canSubtractComplementFive = this.isL2Complex5Subtraction(curDigit, complement);

        return canSubtractComplementDirect || canSubtractComplementFive;
    }

    static isL3Complex10Subtraction(curDigit, subDigit) {
        if (curDigit >= subDigit) return false; // لا تحتاج استلاف عشرات

        const complement = 10 - subDigit;
        
        // الطرح يتطلب: استلف 1 من الخانة التالية، وأضف المكمل للخانة الحالية
        const canAddComplementDirect = this.isL1DirectAddition(curDigit, complement);
        const canAddComplementFive = this.isL2Complex5Addition(curDigit, complement);

        return canAddComplementDirect || canAddComplementFive;
    }

    /**
     * التحقق من القواعد المركبة (LM - Mixed Rules / Family Rules)
     * تجمع بين أصدقاء 5 وأصدقاء 10 في حركة واحدة (مثل إضافة 6, 7, 8, 9 بترحيل مع استخدام الخرزة الخماسية)
     */
    static isLMMixedAddition(curDigit, addDigit) {
        if (curDigit + addDigit < 10) return false;
        const complement = 10 - addDigit;
        // إذا لم تنطبق L1 أو L2 على المكمل، فهي عملية مرّكبة حتماً
        return !this.isL1DirectSubtraction(curDigit, complement) && 
               !this.isL2Complex5Subtraction(curDigit, complement);
    }

    /**
     * الفاحص الرئيسي للعملية أحادية الخانة حسب المستوى المحدد
     */
    static validateSingleDigitOp(curDigit, delta, level) {
        const isAddition = delta > 0;
        const absDelta = Math.abs(delta);

        if (absDelta === 0) return true;

        switch (level) {
            case this.LEVELS.L1:
                return isAddition 
                    ? this.isL1DirectAddition(curDigit, absDelta)
                    : this.isL1DirectSubtraction(curDigit, absDelta);

            case this.LEVELS.L2:
                if (isAddition) {
                    return this.isL1DirectAddition(curDigit, absDelta) || 
                           this.isL2Complex5Addition(curDigit, absDelta);
                } else {
                    return this.isL1DirectSubtraction(curDigit, absDelta) || 
                           this.isL2Complex5Subtraction(curDigit, absDelta);
                }

            case this.LEVELS.L3:
                if (isAddition) {
                    return this.isL1DirectAddition(curDigit, absDelta) || 
                           this.isL2Complex5Addition(curDigit, absDelta) || 
                           this.isL3Complex10Addition(curDigit, absDelta);
                } else {
                    return this.isL1DirectSubtraction(curDigit, absDelta) || 
                           this.isL2Complex5Subtraction(curDigit, absDelta) || 
                           this.isL3Complex10Subtraction(curDigit, absDelta);
                }

            case this.LEVELS.LM:
                return true; // يشمل كافة الحالات الممكنة رياضياً

            default:
                throw new Error(`مستوى القواعد غير معروف: ${level}`);
        }
    }
}

if (typeof module !== 'undefined') {
    module.exports = SorobanBeadEngine;
}