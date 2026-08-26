const SorobanBeadEngine = require('../js/SorobanBeadEngine');
const SorobanTransitionValidator = require('../js/SorobanTransitionValidator');

describe('فحص دقة محرك السوروبان (SorobanBeadEngine)', () => {

    test('فحص L1 - الجمع والطرح المباشر', () => {
        expect(SorobanBeadEngine.isL1DirectAddition(1, 2)).toBe(true);  // 1+2=3 (مباشر)
        expect(SorobanBeadEngine.isL1DirectAddition(2, 3)).toBe(false); // 2+3 ينقل لـ L2
        expect(SorobanBeadEngine.isL1DirectAddition(5, 3)).toBe(true);  // 5+3=8 (مباشر)
        expect(SorobanBeadEngine.isL1DirectSubtraction(8, 3)).toBe(true); // 8-3=5 (مباشر)
    });

    test('فحص L2 - أصدقاء 5', () => {
        expect(SorobanBeadEngine.isL2Complex5Addition(2, 3)).toBe(true);  // 2+3 (استخدام 5)
        expect(SorobanBeadEngine.isL2Complex5Addition(4, 4)).toBe(false); // يتطلب 10 (L3)
        expect(SorobanBeadEngine.isL2Complex5Subtraction(5, 2)).toBe(true); // 5-2 (أصدقاء 5)
    });

    test('فحص L3 - أصدقاء 10 الحقيقي والتثبت من غياب الاستاب الفاسد', () => {
        expect(SorobanBeadEngine.isL3Complex10Addition(9, 1)).toBe(true);  // 9+1 = رحل 1 واطرح 9 (L1)
        expect(SorobanBeadEngine.isL3Complex10Addition(7, 6)).toBe(false); // 7+6 متداخلة (LM mixed)
        expect(SorobanBeadEngine.isL3Complex10Subtraction(10, 1)).toBe(true);
    });

    test('فحص الانتقالات متعددة الخانات', () => {
        const res1 = SorobanTransitionValidator.validateTransition(4, 8, 'L2');
        expect(res1.valid).toBe(false); // يحتاج L3

        const res2 = SorobanTransitionValidator.validateTransition(4, 8, 'L3');
        expect(res2.valid).toBe(true); // مسموح في L3
    });
});