/**
 * MIZAN ANZAN — Soroban Engine v2
 * State-aware Anzan generator.
 *
 * Rules:
 * - 1..15 displayed digits per row
 * - 1..100 rows
 * - addition / subtraction / mixed
 * - levels: simple, f5, f10, mix
 * - negative results OFF by default
 * - validates cumulative state after every row
 * - never accepts a row that cannot be performed by
 *   the selected soroban technique class
 * - BigInt-safe internal arithmetic
 */

(function (global) {

    'use strict';


    /* ---------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------ */

    const LEVELS = Object.freeze({

        SIMPLE: 'simple',

        F5: 'f5',

        F10: 'f10',

        MIX: 'mix'

    });


    const OPERATIONS = Object.freeze({

        ADDITION: 'addition',

        SUBTRACTION: 'subtraction',

        MIXED: 'mixed'

    });


    const TECHNIQUES = Object.freeze({

        DIRECT: 'direct',

        F5: 'f5',

        F10: 'f10',

        MIX: 'mix'

    });


    /* ---------------------------------------------------------------------
     * Secure random integer
     * ------------------------------------------------------------------ */

    function secureRandomInt(min, max) {

        if (
            !Number.isSafeInteger(min) ||
            !Number.isSafeInteger(max) ||
            max < min
        ) {

            throw new Error(
                'Invalid random range.'
            );

        }


        const range =
            max - min + 1;


        /*
         * Full uint32 space = 2^32.
         *
         * The previous implementation used 0xFFFFFFFF
         * as the size of the sample space. That is 2^32 - 1,
         * which is not the actual number of uint32 values.
         */

        const UINT32_SPACE =
            0x100000000;


        if (
            global.crypto &&
            typeof global.crypto.getRandomValues ===
                'function'
        ) {

            /*
             * Rejection sampling avoids modulo bias.
             */

            const limit =
                UINT32_SPACE -
                (
                    UINT32_SPACE %
                    range
                );


            const buffer =
                new Uint32Array(1);


            let value;


            do {

                global.crypto.getRandomValues(
                    buffer
                );

                value =
                    buffer[0];

            } while (
                value >= limit
            );


            return (
                min +
                (
                    value %
                    range
                )
            );

        }


        return (
            min +
            Math.floor(
                Math.random() *
                range
            )
        );

    }


    /* ---------------------------------------------------------------------
     * BigInt helpers
     * ------------------------------------------------------------------ */

    function toBigInt(value) {

        if (
            typeof value ===
            'bigint'
        ) {

            return value;

        }


        if (
            typeof value ===
            'number'
        ) {

            if (
                !Number.isSafeInteger(
                    value
                )
            ) {

                throw new Error(
                    'Unsafe integer.'
                );

            }

            return BigInt(
                value
            );

        }


        if (
            typeof value ===
            'string' &&
            /^-?\d+$/.test(
                value
            )
        ) {

            return BigInt(
                value
            );

        }


        throw new Error(
            'Invalid integer value.'
        );

    }


    function absBigInt(value) {

        return value < 0n
            ? -value
            : value;

    }


    function bigIntDigits(
        value,
        width
    ) {

        const magnitude =
            absBigInt(
                toBigInt(value)
            );


        const text =
            magnitude
                .toString()
                .padStart(
                    width,
                    '0'
                );


        if (
            text.length >
            width
        ) {

            return null;

        }


        return text
            .split('')
            .map(
                Number
            );

    }


    function numberFromDigits(
        digits
    ) {

        return BigInt(
            digits.join('')
        );

    }


    function formatBigInt(
        value
    ) {

        return (
            toBigInt(value)
        ).toString();

    }


    /* ---------------------------------------------------------------------
     * Decimal helpers
     * ------------------------------------------------------------------ */

    function digitsOf(
        value,
        width
    ) {

        return bigIntDigits(
            value,
            width
        );

    }


    /* ---------------------------------------------------------------------
     * Soroban digit classification
     * ------------------------------------------------------------------ */

    /*
     * Addition:
     *
     * d = current digit
     * x = digit to add
     *
     * The classification describes the local bead technique.
     */

    function classifyAddDigit(
        d,
        x
    ) {

        if (
            x === 0
        ) {

            return TECHNIQUES.DIRECT;

        }


        /*
         * Direct earth-bead addition.
         */

        if (
            d <= 4 &&
            x <= 4 &&
            d + x <= 4
        ) {

            return TECHNIQUES.DIRECT;

        }


        /*
         * Direct five-bead addition.
         */

        if (
            d <= 4 &&
            x === 5
        ) {

            return TECHNIQUES.DIRECT;

        }


        /*
         * Add 5 + earth beads.
         */

        if (
            d <= 4 &&
            x > 5 &&
            d + (x - 5) <= 4
        ) {

            return TECHNIQUES.DIRECT;

        }


        /*
         * Five-complement:
         *
         * Example:
         * 3 + 4
         *
         * Cannot be done by direct earth beads.
         * Use +5 -1.
         */

        if (
            x <= 4 &&
            d <= 4 &&
            d + x <= 9
        ) {

            return TECHNIQUES.F5;

        }


        /*
         * Ten-complement / carry.
         */

        if (
            d + x >= 10
        ) {

            const complement =
                10 - x;


            const subClass =
                classifySubDigit(
                    d,
                    complement
                );


            if (
                subClass ===
                TECHNIQUES.F5
            ) {

                return TECHNIQUES.MIX;

            }


            return TECHNIQUES.F10;

        }


        return TECHNIQUES.MIX;

    }


    /*
     * Subtraction classification.
     */

    function classifySubDigit(
        d,
        x
    ) {

        if (
            x === 0
        ) {

            return TECHNIQUES.DIRECT;

        }


        /*
         * Direct earth-bead subtraction.
         */

        if (
            d <= 4 &&
            x <= 4 &&
            d >= x
        ) {

            return TECHNIQUES.DIRECT;

        }


        /*
         * Direct five-bead subtraction.
         */

        if (
            d >= 5 &&
            x === 5
        ) {

            return TECHNIQUES.DIRECT;

        }


        if (
            d >= 5 &&
            x > 5 &&
            d - x >= 0
        ) {

            return TECHNIQUES.DIRECT;

        }


        /*
         * Five-complement subtraction.
         *
         * Example:
         * 8 - 3
         *
         * Use -5 +2.
         */

        if (
            d >= 5 &&
            x <= 4 &&
            d >= x
        ) {

            return TECHNIQUES.F5;

        }


        /*
         * Otherwise borrowing is required.
         */

        return TECHNIQUES.F10;

    }


    /* ---------------------------------------------------------------------
     * Apply addition
     * ------------------------------------------------------------------ */

    function applyAddition(
        stateDigits,
        operandDigits
    ) {

        const digits =
            stateDigits.slice();


        const width =
            digits.length;


        const techniques =
            [];


        for (
            let i = width - 1;
            i >= 0;
            i--
        ) {

            const x =
                operandDigits[i];


            if (
                x === 0
            ) {

                continue;

            }


            const d =
                digits[i];


            const classification =
                classifyAddDigit(
                    d,
                    x
                );


            /*
             * No carry.
             */

            if (
                d + x <= 9
            ) {

                digits[i] =
                    d + x;


                techniques.push(
                    classification
                );


                continue;

            }


            /*
             * Carry.
             */

            digits[i] =
                d + x - 10;


            techniques.push(
                classification
            );


            let j =
                i - 1;


            while (
                j >= 0
            ) {

                const previous =
                    digits[j];


                const carryClass =
                    classifyAddDigit(
                        previous,
                        1
                    );


                if (
                    previous < 9
                ) {

                    digits[j] =
                        previous + 1;


                    techniques.push(
                        carryClass
                    );


                    break;

                }


                digits[j] =
                    0;


                techniques.push(
                    carryClass
                );


                j--;

            }


            if (
                j < 0
            ) {

                return null;

            }

        }


        return {

            digits,

            techniques,

            value:
                numberFromDigits(
                    digits
                )

        };

    }


    /* ---------------------------------------------------------------------
     * Apply subtraction
     * ------------------------------------------------------------------ */

    function applySubtraction(
        stateDigits,
        operandDigits
    ) {

        const digits =
            stateDigits.slice();


        const width =
            digits.length;


        const techniques =
            [];


        for (
            let i = width - 1;
            i >= 0;
            i--
        ) {

            const x =
                operandDigits[i];


            if (
                x === 0
            ) {

                continue;

            }


            const d =
                digits[i];


            /*
             * Direct subtraction.
             */

            if (
                d >= x
            ) {

                const classification =
                    classifySubDigit(
                        d,
                        x
                    );


                if (
                    classification ===
                    TECHNIQUES.F10
                ) {

                    /*
                     * If the local digit itself is
                     * sufficient, no borrow is needed.
                     * Reclassify based on actual move.
                     */

                    if (
                        d - x >= 0
                    ) {

                        digits[i] =
                            d - x;


                        techniques.push(
                            classification ===
                            TECHNIQUES.F10
                                ? (
                                    d >= 5
                                        ? TECHNIQUES.F5
                                        : TECHNIQUES.DIRECT
                                )
                                : classification
                        );


                        continue;

                    }

                }


                digits[i] =
                    d - x;


                techniques.push(
                    classification
                );


                continue;

            }


            /*
             * Borrow from the left.
             */

            let j =
                i - 1;


            while (
                j >= 0 &&
                digits[j] === 0
            ) {

                digits[j] =
                    9;


                techniques.push(
                    TECHNIQUES.F10
                );


                j--;

            }


            if (
                j < 0
            ) {

                return null;

            }


            /*
             * The borrowed-from column must itself
             * be decrementable.
             */

            const previous =
                digits[j];


            const previousClass =
                classifySubDigit(
                    previous,
                    1
                );


            if (
                previous <= 0
            ) {

                return null;

            }


            digits[j] =
                previous - 1;


            techniques.push(
                previousClass
            );


            /*
             * Current column becomes:
             *
             * d + (10 - x)
             */

            const complement =
                10 - x;


            const addClass =
                classifyAddDigit(
                    d,
                    complement
                );


            techniques.push(
                addClass ===
                TECHNIQUES.F5
                    ? TECHNIQUES.MIX
                    : TECHNIQUES.F10
            );


            digits[i] =
                d +
                complement;

        }


        return {

            digits,

            techniques,

            value:
                numberFromDigits(
                    digits
                )

        };

    }


    /* ---------------------------------------------------------------------
     * Apply generic operation
     * ------------------------------------------------------------------ */

    function applyOperation(
        stateDigits,
        signedTerm
    ) {

        const term =
            toBigInt(
                signedTerm
            );


        const magnitude =
            absBigInt(
                term
            );


        const operand =
            digitsOf(
                magnitude,
                stateDigits.length
            );


        if (!operand) {

            return null;

        }


        if (
            term >= 0n
        ) {

            return applyAddition(
                stateDigits,
                operand
            );

        }


        return applySubtraction(
            stateDigits,
            operand
        );

    }


    /* ---------------------------------------------------------------------
     * Technique validation
     * ------------------------------------------------------------------ */

    function techniquesAllowed(
        level,
        techniques
    ) {

        const hasF5 =
            techniques.includes(
                TECHNIQUES.F5
            ) ||
            techniques.includes(
                TECHNIQUES.MIX
            );


        const hasF10 =
            techniques.includes(
                TECHNIQUES.F10
            ) ||
            techniques.includes(
                TECHNIQUES.MIX
            );


        switch (
            level
        ) {

            case LEVELS.SIMPLE:

                return techniques.every(
                    t =>
                        t ===
                        TECHNIQUES.DIRECT
                );


            case LEVELS.F5:

                return (
                    techniques.every(
                        t =>
                            t ===
                            TECHNIQUES.DIRECT
                            ||
                            t ===
                            TECHNIQUES.F5
                    )
                    &&
                    hasF5
                );


            case LEVELS.F10:

                return (
                    techniques.every(
                        t =>
                            t ===
                            TECHNIQUES.DIRECT
                            ||
                            t ===
                            TECHNIQUES.F10
                    )
                    &&
                    hasF10
                );


            case LEVELS.MIX:

                return (
                    techniques.every(
                        t =>
                            t ===
                            TECHNIQUES.DIRECT
                            ||
                            t ===
                            TECHNIQUES.F5
                            ||
                            t ===
                            TECHNIQUES.F10
                            ||
                            t ===
                            TECHNIQUES.MIX
                    )
                    &&
                    hasF5
                    &&
                    hasF10
                );


            default:

                return false;

        }

    }


    /* ---------------------------------------------------------------------
     * Validate operation
     * ------------------------------------------------------------------ */

    function validateOperation(
        current,
        term,
        config
    ) {

        const width =
            config.internalWidth;


        const currentBig =
            toBigInt(
                current
            );


        if (
            currentBig < 0n
        ) {

            return {

                valid: false,

                reason:
                    'negative_state'

            };

        }


        const state =
            digitsOf(
                currentBig,
                width
            );


        if (!state) {

            return {

                valid: false,

                reason:
                    'state_overflow'

            };

        }


        const applied =
            applyOperation(
                state,
                term
            );


        if (!applied) {

            return {

                valid: false,

                reason:
                    'soroban_transition_invalid'

            };

        }


        /*
         * Absolute negative protection.
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
         * The level must accept every individual
         * technique used during this transition.
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

            value:
                applied.value,

            valueString:
                formatBigInt(
                    applied.value
                ),

            techniques:
                applied.techniques

        };

    }


    /* ---------------------------------------------------------------------
     * Operation signs
     * ------------------------------------------------------------------ */

    function operationSigns(
        operation
    ) {

        if (
            operation ===
            OPERATIONS.ADDITION
        ) {

            return [1];

        }


        if (
            operation ===
            OPERATIONS.SUBTRACTION
        ) {

            return [-1];

        }


        return [1, -1];

    }


    /* ---------------------------------------------------------------------
     * Random operand
     * ------------------------------------------------------------------ */

    function randomOperand(
        digits
    ) {

        /*
         * For one digit:
         * 1..9
         *
         * For N digits:
         * 10^(N-1)..10^N-1
         */

        if (
            digits === 1
        ) {

            return secureRandomInt(
                1,
                9
            );

        }


        /*
         * Number remains safe for max 15 digits
         * only as a generation range if handled carefully.
         *
         * 10^15 - 1 is not safe as an integer.
         *
         * Therefore generate each digit independently.
         */

        let result =
            '';


        result +=
            secureRandomInt(
                1,
                9
            ).toString();


        for (
            let i = 1;
            i < digits;
            i++
        ) {

            result +=
                secureRandomInt(
                    0,
                    9
                ).toString();

        }


        return BigInt(
            result
        );

    }


    /* ---------------------------------------------------------------------
     * Configuration
     * ------------------------------------------------------------------ */

    function validateConfig(
        raw
    ) {

        const config =
            Object.assign(

                {

                    digits: 2,

                    rows: 4,

                    operation:
                        OPERATIONS.ADDITION,

                    level:
                        LEVELS.SIMPLE,

                    allowNegative:
                        false,

                    maxGenerationAttempts:
                        300,

                    candidatesPerRow:
                        120

                },

                raw || {}

            );


        if (
            !Number.isInteger(
                config.digits
            ) ||
            config.digits < 1 ||
            config.digits > 15
        ) {

            throw new Error(
                'digits must be between 1 and 15.'
            );

        }


        if (
            !Number.isInteger(
                config.rows
            ) ||
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
                'Invalid level.'
            );

        }


        if (
            !Number.isInteger(
                config.maxGenerationAttempts
            ) ||
            config.maxGenerationAttempts < 1
        ) {

            throw new Error(
                'maxGenerationAttempts must be a positive integer.'
            );

        }


        if (
            !Number.isInteger(
                config.candidatesPerRow
            ) ||
            config.candidatesPerRow < 1
        ) {

            throw new Error(
                'candidatesPerRow must be a positive integer.'
            );

        }


        /*
         * Extra internal rods provide room for carries.
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


    /* ---------------------------------------------------------------------
     * Initial number
     * ------------------------------------------------------------------ */

    function chooseInitial(
        config
    ) {

        return randomOperand(
            config.digits
        );

    }


    /* ---------------------------------------------------------------------
     * Candidate signs
     * ------------------------------------------------------------------ */

    function candidateSigns(
        config
    ) {

        const signs =
            operationSigns(
                config.operation
            );


        if (
            config.operation !==
            OPERATIONS.MIXED
        ) {

            return signs;

        }


        /*
         * For mixed operations we intentionally
         * randomize sign ordering.
         */

        return (
            Math.random() < 0.5
                ? [1, -1]
                : [-1, 1]
        );

    }


    /* ---------------------------------------------------------------------
     * Generate sequence
     * ------------------------------------------------------------------ */

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


            const techniqueTrace =
                [];


            const stateTrace =
                [current];


            let hasF5 =
                false;


            let hasF10 =
                false;


            let failed =
                false;


            /*
             * Generate remaining rows.
             */

            for (
                let row = 1;
                row < config.rows;
                row++
            ) {

                const candidates =
                    [];


                for (
                    const sign
                    of candidateSigns(
                        config
                    )
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
                            sign === 1
                                ? magnitude
                                : -magnitude;


                        const check =
                            validateOperation(
                                current,
                                term,
                                config
                            );


                        if (
                            !check.valid
                        ) {

                            continue;

                        }


                        const rowHasF5 =
                            check.techniques.includes(
                                TECHNIQUES.F5
                            ) ||
                            check.techniques.includes(
                                TECHNIQUES.MIX
                            );


                        const rowHasF10 =
                            check.techniques.includes(
                                TECHNIQUES.F10
                            ) ||
                            check.techniques.includes(
                                TECHNIQUES.MIX
                            );


                        let priority =
                            0;


                        /*
                         * Prefer satisfying missing
                         * skills in MIX.
                         */

                        if (
                            config.level ===
                            LEVELS.MIX
                        ) {

                            if (
                                !hasF5 &&
                                rowHasF5
                            ) {

                                priority += 10;

                            }


                            if (
                                !hasF10 &&
                                rowHasF10
                            ) {

                                priority += 10;

                            }

                        }


                        if (
                            config.level ===
                            LEVELS.F5 &&
                            rowHasF5
                        ) {

                            priority += 5;

                        }


                        if (
                            config.level ===
                            LEVELS.F10 &&
                            rowHasF10
                        ) {

                            priority += 5;

                        }


                        /*
                         * Prefer transitions containing
                         * an actual target technique.
                         */

                        if (
                            rowHasF5 ||
                            rowHasF10
                        ) {

                            priority += 1;

                        }


                        candidates.push({

                            term,

                            value:
                                check.value,

                            techniques:
                                check.techniques,

                            priority

                        });

                    }

                }


                if (
                    !candidates.length
                ) {

                    failed =
                        true;

                    break;

                }


                candidates.sort(
                    (a, b) =>
                        b.priority -
                        a.priority
                );


                const top =
                    candidates.slice(
                        0,
                        Math.min(
                            16,
                            candidates.length
                        )
                    );


                const chosen =
                    top[
                        secureRandomInt(
                            0,
                            top.length - 1
                        )
                    ];


                current =
                    chosen.value;


                terms.push(
                    chosen.term
                );


                techniqueTrace.push(
                    chosen.techniques
                );


                stateTrace.push(
                    current
                );


                hasF5 =
                    hasF5 ||
                    chosen.techniques.includes(
                        TECHNIQUES.F5
                    ) ||
                    chosen.techniques.includes(
                        TECHNIQUES.MIX
                    );


                hasF10 =
                    hasF10 ||
                    chosen.techniques.includes(
                        TECHNIQUES.F10
                    ) ||
                    chosen.techniques.includes(
                        TECHNIQUES.MIX
                    );

            }


            if (
                failed
            ) {

                continue;

            }


            /*
             * Skill requirements.
             */

            if (
                config.level ===
                LEVELS.F5 &&
                !hasF5
            ) {

                continue;

            }


            if (
                config.level ===
                LEVELS.F10 &&
                !hasF10
            ) {

                continue;

            }


            if (
                config.level ===
                LEVELS.MIX &&
                (
                    !hasF5 ||
                    !hasF10
                )
            ) {

                continue;

            }


            /*
             * Calculate answer independently.
             *
             * This is a second integrity check.
             */

            const answer =
                terms.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum +
                        toBigInt(
                            value
                        ),
                    0n
                );


            /*
             * Final state must exactly match
             * the independently calculated answer.
             */

            if (
                answer !== current
            ) {

                continue;

            }


            if (
                !config.allowNegative &&
                answer < 0n
            ) {

                continue;

            }


            return {

                terms,

                answer,

                answerString:
                    answer.toString(),

                finalValue:
                    current,

                finalValueString:
                    current.toString(),

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

                techniqueTrace,

                stateTrace

            };

        }


        throw new Error(

            'تعذر توليد تحدٍ صالح بهذه الإعدادات دون كسر قواعد السوروبان. ' +

            'خفّض عدد الصفوف أو غيّر العملية/المستوى.'

        );

    }


    /* ---------------------------------------------------------------------
     * Display
     * ------------------------------------------------------------------ */

    function formatTerm(
        term
    ) {

        const value =
            toBigInt(
                term
            );


        return (
            value < 0n
                ? `−${absBigInt(value)}`
                : `${value}`
        );

    }


    function toDisplay(
        sequence
    ) {

        return sequence
            .terms
            .map(
                formatTerm
            )
            .join(
                '  '
            );

    }


    /* ---------------------------------------------------------------------
     * Public API
     * ------------------------------------------------------------------ */

    global.MizanAnzanSoroban =
        Object.freeze({

            LEVELS,

            OPERATIONS,

            TECHNIQUES,

            validateConfig,

            validateOperation,

            generateSequence,

            toDisplay

        });


})(window);