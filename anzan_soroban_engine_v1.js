/**
 * ============================================================
 * MIZAN ANZAN — SOROBAN CORE ENGINE
 * ============================================================
 *
 * المحرك المرجعي الوحيد لتوليد أنزان سوروبان.
 *
 * القاعدة المركزية:
 *
 * L1  = DIRECT فقط
 * L2  = FRIEND-5 فقط
 * L3  = FRIEND-10 فقط
 * LM  = DIRECT + FRIEND-5 + FRIEND-10
 *
 * ممنوع:
 * - خلط مستويات القواعد
 * - fallback عشوائي
 * - قبول انتقال غير صالح
 * - قبول نتيجة سالبة عندما allowNegative = false
 * - التحقق من النتيجة النهائية فقط
 *
 * كل انتقال:
 *
 * Current State
 *      ↓
 * Soroban Transition
 *      ↓
 * Technique Classification
 *      ↓
 * Level Gate
 *      ↓
 * Cumulative State
 *      ↓
 * Accept / Reject
 *
 * ============================================================
 */

(function (global) {

    'use strict';

    const LEVELS = Object.freeze({
        L1: 'L1',
        L2: 'L2',
        L3: 'L3',
        LM: 'LM'
    });

    const OPERATIONS = Object.freeze({
        ADDITION: 'addition',
        SUBTRACTION: 'subtraction',
        MIXED: 'mixed'
    });

    const TECHNIQUES = Object.freeze({
        DIRECT: 'direct',
        FRIEND_5: 'f5',
        FRIEND_10: 'f10',
        MIXED_F5_F10: 'mix'
    });

    const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

    /*
    ============================================================
    Secure random integer
    ============================================================
    */

    function secureRandomInt(min, max) {

        if (
            !Number.isSafeInteger(min) ||
            !Number.isSafeInteger(max) ||
            max < min
        ) {
            throw new Error('Invalid random range.');
        }

        const range = max - min + 1;

        if (
            global.crypto &&
            typeof global.crypto.getRandomValues === 'function'
        ) {

            const UINT32_RANGE = 0x100000000;

            const limit =
                Math.floor(UINT32_RANGE / range) * range;

            const buffer =
                new Uint32Array(1);

            do {
                global.crypto.getRandomValues(buffer);
            } while (buffer[0] >= limit);

            return min + (buffer[0] % range);
        }

        return (
            min +
            Math.floor(
                Math.random() * range
            )
        );
    }

    /*
    ============================================================
    BigInt helpers
    ============================================================
    */

    function toBigInt(value) {

        if (typeof value === 'bigint') {
            return value;
        }

        if (
            typeof value === 'number' &&
            Number.isSafeInteger(value)
        ) {
            return BigInt(value);
        }

        if (
            typeof value === 'string' &&
            /^-?\d+$/.test(value.trim())
        ) {
            return BigInt(value.trim());
        }

        throw new Error('Value must be an integer.');
    }

    function digitsOf(value, width) {

        let n = toBigInt(value);

        if (n < 0n) {
            n = -n;
        }

        const digits =
            Array(width).fill(0);

        for (
            let i = width - 1;
            i >= 0;
            i--
        ) {

            digits[i] =
                Number(n % 10n);

            n /= 10n;
        }

        if (n !== 0n) {
            throw new Error(
                'Value exceeds internal width.'
            );
        }

        return digits;
    }

    function numberFromDigits(digits) {

        return digits.reduce(
            (value, digit) =>
                value * 10n + BigInt(digit),
            0n
        );
    }

    /*
    ============================================================
    Technique classification
    ============================================================

    Important:

    DIRECT is NOT automatically allowed in L2 or L3.

    This is intentional.

    L1 = DIRECT
    L2 = FRIEND-5
    L3 = FRIEND-10
    LM = all
    ============================================================
    */

    function classifyAddNoCarry(d, x) {

        if (x === 0) {
            return TECHNIQUES.DIRECT;
        }

        const upper =
            d >= 5;

        const earth =
            d % 5;

        /*
        Direct:
        إضافة الخرز السفلي المتاح مباشرة.
        */

        if (
            x <= 4 &&
            earth + x <= 4
        ) {
            return TECHNIQUES.DIRECT;
        }

        /*
        +5 أو +5 مع خرز سفلي
        عندما تكون الخرزة الخماسية غير مفعلة.
        */

        if (
            !upper &&
            x >= 5 &&
            earth + (x - 5) <= 4
        ) {
            return TECHNIQUES.DIRECT;
        }

        /*
        Friend-5:
        +x = +5 - (5-x)
        */

        if (
            upper &&
            x <= 4
        ) {
            return TECHNIQUES.FRIEND_5;
        }

        return null;
    }

    function classifySubNoBorrow(d, x) {

        if (x === 0) {
            return TECHNIQUES.DIRECT;
        }

        const upper =
            d >= 5;

        const earth =
            d % 5;

        /*
        Direct subtraction.
        */

        if (
            x <= 4 &&
            earth >= x
        ) {
            return TECHNIQUES.DIRECT;
        }

        /*
        Direct removal of 5 + earth beads.
        */

        if (
            upper &&
            x >= 5 &&
            earth >= x - 5
        ) {
            return TECHNIQUES.DIRECT;
        }

        /*
        Friend-5:
        -x = -5 + (5-x)
        */

        if (
            upper &&
            x <= 4
        ) {
            return TECHNIQUES.FRIEND_5;
        }

        return null;
    }

    function classifyAddDigit(d, x) {

        if (x === 0) {
            return TECHNIQUES.DIRECT;
        }

        /*
        No carry.
        */

        if (d + x <= 9) {

            return (
                classifyAddNoCarry(d, x)
            );
        }

        /*
        Carry => Friend-10.
        */

        const complement =
            10 - x;

        const subClass =
            classifySubNoBorrow(
                d,
                complement
            );

        /*
        If the 10-complement itself requires
        Friend-5, this is a compound technique.

        It is NOT pure L3.
        It is allowed only in LM.
        */

        if (
            subClass ===
            TECHNIQUES.FRIEND_5
        ) {
            return TECHNIQUES.MIXED_F5_F10;
        }

        return TECHNIQUES.FRIEND_10;
    }

    function classifySubDigit(d, x) {

        if (x === 0) {
            return TECHNIQUES.DIRECT;
        }

        /*
        Direct / Friend-5 without borrow.
        */

        if (d >= x) {

            return classifySubNoBorrow(
                d,
                x
            );
        }

        /*
        Borrow => Friend-10.
        */

        return TECHNIQUES.FRIEND_10;
    }

    /*
    ============================================================
    Apply operation to the current Soroban state
    ============================================================
    */

    function applyOperation(
        stateDigits,
        signedTerm
    ) {

        const digits =
            stateDigits.slice();

        const width =
            digits.length;

        const term =
            toBigInt(signedTerm);

        const negative =
            term < 0n;

        const magnitude =
            negative
                ? -term
                : term;

        const operand =
            digitsOf(
                magnitude,
                width
            );

        const techniques = [];

        /*
        IMPORTANT:
        Process from units to highest rod.
        */

        for (
            let i = width - 1;
            i >= 0;
            i--
        ) {

            const x =
                operand[i];

            if (x === 0) {
                continue;
            }

            const d =
                digits[i];

            /*
            ====================================================
            ADDITION
            ====================================================
            */

            if (!negative) {

                const classification =
                    classifyAddDigit(
                        d,
                        x
                    );

                if (!classification) {
                    return null;
                }

                /*
                No carry.
                */

                if (d + x <= 9) {

                    digits[i] =
                        d + x;

                    techniques.push(
                        classification
                    );

                    continue;
                }

                /*
                Carry.
                */

                digits[i] =
                    d + x - 10;

                techniques.push(
                    classification
                );

                let j =
                    i - 1;

                while (j >= 0) {

                    const previous =
                        digits[j];

                    const carryClass =
                        classifyAddNoCarry(
                            previous,
                            1
                        );

                    if (!carryClass) {
                        return null;
                    }

                    if (previous < 9) {

                        digits[j] =
                            previous + 1;

                        techniques.push(
                            carryClass
                        );

                        break;
                    }

                    digits[j] = 0;

                    techniques.push(
                        carryClass
                    );

                    j--;
                }

                if (j < 0) {
                    return null;
                }

                continue;
            }

            /*
            ====================================================
            SUBTRACTION
            ====================================================
            */

            if (d >= x) {

                const classification =
                    classifySubDigit(
                        d,
                        x
                    );

                if (!classification) {
                    return null;
                }

                digits[i] =
                    d - x;

                techniques.push(
                    classification
                );

                continue;
            }

            /*
            Borrow.
            */

            let j =
                i - 1;

            while (
                j >= 0 &&
                digits[j] === 0
            ) {

                digits[j] = 9;

                techniques.push(
                    TECHNIQUES.FRIEND_10
                );

                j--;
            }

            if (j < 0) {
                return null;
            }

            const previous =
                digits[j];

            const previousClass =
                classifySubNoBorrow(
                    previous,
                    1
                );

            if (!previousClass) {
                return null;
            }

            digits[j] =
                previous - 1;

            techniques.push(
                previousClass
            );

            const complement =
                10 - x;

            const addClass =
                classifyAddNoCarry(
                    d,
                    complement
                );

            if (!addClass) {
                return null;
            }

            digits[i] =
                d + complement;

            techniques.push(
                addClass ===
                TECHNIQUES.FRIEND_5
                    ? TECHNIQUES.MIXED_F5_F10
                    : TECHNIQUES.FRIEND_10
            );
        }

        return {
            digits,
            techniques,
            value:
                numberFromDigits(digits)
        };
    }

    /*
    ============================================================
    Level Gate
    ============================================================

    THIS IS THE GOLDEN RULE.

    L1:
        DIRECT only

    L2:
        FRIEND-5 only

    L3:
        FRIEND-10 only

    LM:
        DIRECT + FRIEND-5 + FRIEND-10
        Compound F5+F10 is also accepted because
        it is explicitly composed of both permitted
        techniques.
    ============================================================
    */

    function techniquesAllowed(
        level,
        techniques
    ) {

        if (!Array.isArray(techniques) ||
            techniques.length === 0) {
            return false;
        }

        switch (level) {

            case LEVELS.L1:

                return techniques.every(
                    technique =>
                        technique ===
                        TECHNIQUES.DIRECT
                );

            case LEVELS.L2:

                return techniques.every(
                    technique =>
                        technique ===
                        TECHNIQUES.FRIEND_5
                );

            case LEVELS.L3:

                return techniques.every(
                    technique =>
                        technique ===
                        TECHNIQUES.FRIEND_10
                );

            case LEVELS.LM:

                return techniques.every(
                    technique =>
                        technique === TECHNIQUES.DIRECT ||
                        technique === TECHNIQUES.FRIEND_5 ||
                        technique === TECHNIQUES.FRIEND_10 ||
                        technique === TECHNIQUES.MIXED_F5_F10
                );

            default:

                return false;
        }
    }

    /*
    ============================================================
    Validate one complete transition
    ============================================================
    */

    function validateOperation(
        current,
        term,
        config
    ) {

        const currentValue =
            toBigInt(current);

        const signedTerm =
            toBigInt(term);

        /*
        Gold rule:
        no negative cumulative state
        unless explicitly enabled.
        */

        if (
            !config.allowNegative &&
            signedTerm < 0n &&
            -signedTerm > currentValue
        ) {

            return {
                valid: false,
                reason: 'negative_result'
            };
        }

        const state =
            digitsOf(
                currentValue,
                config.internalWidth
            );

        const applied =
            applyOperation(
                state,
                signedTerm
            );

        if (!applied) {

            return {
                valid: false,
                reason:
                    'soroban_transition_invalid'
            };
        }

        /*
        Verify cumulative state.
        */

        if (
            !config.allowNegative &&
            applied.value < 0n
        ) {

            return {
                valid: false,
                reason:
                    'negative_result'
            };
        }

        /*
        Verify level.
        */

        if (
            !techniquesAllowed(
                config.level,
                applied.techniques
            )
        ) {

            return {
                valid: false,
                reason:
                    'level_rule_mismatch'
            };
        }

        return {
            valid: true,
            value: applied.value,
            valueString:
                applied.value.toString(),
            techniques:
                applied.techniques
        };
    }

    /*
    ============================================================
    Configuration
    ============================================================
    */

    function validateConfig(raw) {

        const config =
            Object.assign(
                {
                    digits: 2,
                    rows: 4,
                    operation:
                        OPERATIONS.ADDITION,
                    level:
                        LEVELS.L1,
                    allowNegative: false,
                    maxGenerationAttempts: 500,
                    candidatesPerRow: 150
                },
                raw || {}
            );

        if (
            !Number.isInteger(config.digits) ||
            config.digits < 1 ||
            config.digits > 15
        ) {
            throw new Error(
                'digits must be between 1 and 15.'
            );
        }

        if (
            !Number.isInteger(config.rows) ||
            config.rows < 1 ||
            config.rows > 100
        ) {
            throw new Error(
                'rows must be between 1 and 100.'
            );
        }

        if (
            !Object.values(
                OPERATIONS
            ).includes(
                config.operation
            )
        ) {
            throw new Error(
                'Invalid operation.'
            );
        }

        if (
            !Object.values(
                LEVELS
            ).includes(
                config.level
            )
        ) {
            throw new Error(
                'Invalid Soroban level.'
            );
        }

        if (
            !Number.isInteger(
                config.maxGenerationAttempts
            ) ||
            config.maxGenerationAttempts < 1
        ) {
            throw new Error(
                'maxGenerationAttempts must be positive.'
            );
        }

        if (
            !Number.isInteger(
                config.candidatesPerRow
            ) ||
            config.candidatesPerRow < 1
        ) {
            throw new Error(
                'candidatesPerRow must be positive.'
            );
        }

        /*
        Internal width:

        displayed digits
        +
        carry/borrow capacity
        +
        safety margin
        */

        config.internalWidth =
            config.digits +
            Math.ceil(
                Math.log10(
                    config.rows + 1
                )
            ) +
            2;

        return config;
    }

    /*
    ============================================================
    Initial value
    ============================================================
    */

    function chooseInitial(config) {

        const min =
            Math.pow(
                10,
                config.digits - 1
            );

        const max =
            Math.pow(
                10,
                config.digits
            ) - 1;

        return BigInt(
            secureRandomInt(
                min,
                max
            )
        );
    }

    function randomOperand(digits) {

        const min =
            Math.pow(
                10,
                digits - 1
            );

        const max =
            Math.pow(
                10,
                digits
            ) - 1;

        return BigInt(
            secureRandomInt(
                min,
                max
            )
        );
    }

    function candidateSigns(config) {

        if (
            config.operation ===
            OPERATIONS.ADDITION
        ) {
            return [1];
        }

        if (
            config.operation ===
            OPERATIONS.SUBTRACTION
        ) {
            return [-1];
        }

        return Math.random() < 0.5
            ? [1, -1]
            : [-1, 1];
    }

    /*
    ============================================================
    Generate complete sequence
    ============================================================
    */

    function generateSequence(
        rawConfig
    ) {

        const config =
            validateConfig(
                rawConfig
            );

        for (
            let attempt = 0;
            attempt <
            config.maxGenerationAttempts;
            attempt++
        ) {

            let current =
                chooseInitial(
                    config
                );

            const terms =
                [current];

            const stateTrace =
                [current];

            const techniqueTrace =
                [];

            let failed =
                false;

            for (
                let row = 1;
                row < config.rows;
                row++
            ) {

                const candidates =
                    [];

                for (
                    const sign of
                    candidateSigns(config)
                ) {

                    for (
                        let k = 0;
                        k <
                        config.candidatesPerRow;
                        k++
                    ) {

                        const magnitude =
                            randomOperand(
                                config.digits
                            );

                        const term =
                            BigInt(sign) *
                            magnitude;

                        const check =
                            validateOperation(
                                current,
                                term,
                                config
                            );

                        /*
                        INVALID = NEVER ENTER CANDIDATES
                        */

                        if (!check.valid) {
                            continue;
                        }

                        /*
                        Ensure cumulative state
                        is correct before accepting.
                        */

                        if (
                            !config.allowNegative &&
                            check.value < 0n
                        ) {
                            continue;
                        }

                        candidates.push({
                            term,
                            value:
                                check.value,
                            techniques:
                                check.techniques
                        });
                    }
                }

                /*
                No candidate means this configuration
                cannot produce a legal row.

                DO NOT FALLBACK.
                */

                if (
                    candidates.length === 0
                ) {

                    failed = true;

                    break;
                }

                /*
                Select uniformly among legal candidates.
                */

                const chosen =
                    candidates[
                        secureRandomInt(
                            0,
                            candidates.length - 1
                        )
                    ];

                current =
                    chosen.value;

                terms.push(
                    chosen.term
                );

                stateTrace.push(
                    current
                );

                techniqueTrace.push(
                    chosen.techniques
                );
            }

            if (failed) {
                continue;
            }

            /*
            Final cumulative verification.
            */

            if (
                !config.allowNegative &&
                current < 0n
            ) {
                continue;
            }

            /*
            Final independent answer.
            */

            const answer =
                terms.reduce(
                    (sum, term) =>
                        sum + term,
                    0n
                );

            /*
            Integrity:
            independently calculated answer must equal
            the state engine's final state.
            */

            if (
                answer !== current
            ) {
                continue;
            }

            return {

                terms,

                termsDisplay:
                    terms.map(
                        formatTerm
                    ),

                answer,

                answerString:
                    answer.toString(),

                finalValue:
                    current,

                finalValueString:
                    current.toString(),

                answerNumber:
                    answer <= MAX_SAFE &&
                    answer >= -MAX_SAFE
                        ? Number(answer)
                        : null,

                level:
                    config.level,

                operation:
                    config.operation,

                digits:
                    config.digits,

                rows:
                    config.rows,

                allowNegative:
                    config.allowNegative,

                stateTrace,

                techniqueTrace
            };
        }

        throw new Error(
            'تعذر توليد تسلسل سوروبان صالح بهذه الإعدادات. ' +
            'لم يتم استخدام أي fallback أو تجاوز للقواعد. ' +
            'خفّض عدد الصفوف أو غيّر الإعدادات.'
        );
    }

    /*
    ============================================================
    Formatting
    ============================================================
    */

    function formatTerm(term) {

        const value =
            toBigInt(term);

        return value < 0n
            ? `−${(-value).toString()}`
            : value.toString();
    }

    function toDisplay(sequence) {

        return sequence.terms
            .map(formatTerm)
            .join('  ');
    }

    /*
    ============================================================
    Public API
    ============================================================
    */

    global.MizanAnzanSoroban =
        Object.freeze({

            LEVELS,

            OPERATIONS,

            TECHNIQUES,

            validateConfig,

            validateOperation,

            generateSequence,

            formatTerm,

            toDisplay
        });

})(typeof window !== 'undefined'
    ? window
    : globalThis);