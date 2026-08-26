/**
 * ============================================================================
 * MIZAN ANZAN — Soroban Engine v3
 * ============================================================================
 *
 * State-aware Anzan generator for Japanese Soroban mental arithmetic.
 *
 * Design principles:
 *
 * 1. BigInt-safe arithmetic
 * 2. State-aware transitions
 * 3. Technique-aware validation
 * 4. No invalid Soroban transition is accepted
 * 5. Negative results disabled by default
 * 6. Independent final-answer verification
 * 7. Complete state / technique traces
 * 8. Deterministic validation + cryptographically strong randomness
 *
 * Supported:
 *
 * digits:
 *   1 .. 15
 *
 * rows:
 *   1 .. 100
 *
 * operations:
 *   addition
 *   subtraction
 *   mixed
 *
 * levels:
 *   simple
 *   f5
 *   f10
 *   mix
 *
 * ============================================================================
 */

(function (global) {

    'use strict';


    /* =========================================================================
     * CONSTANTS
     * ========================================================================= */

    const VERSION =
        '3.1.0';


    const LEVELS =
        Object.freeze({

            SIMPLE: 'simple',

            F5: 'f5',

            F10: 'f10',

            MIX: 'mix'

        });


    const OPERATIONS =
        Object.freeze({

            ADDITION: 'addition',

            SUBTRACTION: 'subtraction',

            MIXED: 'mixed'

        });


    const TECHNIQUES =
        Object.freeze({

            DIRECT: 'direct',

            F5: 'f5',

            F10: 'f10',

            MIX: 'mix'

        });


    const REASONS =
        Object.freeze({

            INVALID_CONFIG:
                'invalid_config',

            INVALID_INTEGER:
                'invalid_integer',

            NEGATIVE_STATE:
                'negative_state',

            NEGATIVE_RESULT:
                'negative_result',

            STATE_OVERFLOW:
                'state_overflow',

            OPERAND_OVERFLOW:
                'operand_overflow',

            SOROBAN_TRANSITION_INVALID:
                'soroban_transition_invalid',

            LEVEL_RULE_MISMATCH:
                'level_rule_mismatch',

            OPERATION_SIGN_MISMATCH:
                'operation_sign_mismatch',

            EMPTY_SEQUENCE:
                'empty_sequence',

            ROW_COUNT_MISMATCH:
                'row_count_mismatch',

            FINAL_STATE_MISMATCH:
                'final_state_mismatch',

            TECHNIQUE_REQUIREMENT:
                'technique_requirement'

        });


    /* =========================================================================
     * INTEGER HELPERS
     * ========================================================================= */

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
                value.trim()
            )
        ) {

            return BigInt(
                value.trim()
            );

        }


        throw new Error(
            'Invalid integer value.'
        );

    }


    function absBigInt(value) {

        const n =
            toBigInt(
                value
            );


        return n < 0n
            ? -n
            : n;

    }


    function compareBigInt(a, b) {

        const x =
            toBigInt(a);

        const y =
            toBigInt(b);


        if (x < y) {

            return -1;

        }


        if (x > y) {

            return 1;

        }


        return 0;

    }


    function formatBigInt(value) {

        return toBigInt(
            value
        ).toString();

    }


    /* =========================================================================
     * SECURE RANDOMNESS
     * ========================================================================= */

    function secureRandomInt(
        min,
        max
    ) {

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
            max -
            min +
            1;


        /*
         * Browser Uint32 space contains exactly:
         *
         * 0 .. 4,294,967,295
         *
         * Therefore the number of possible values is 2^32.
         */

        const UINT32_SPACE =
            0x100000000;


        if (
            global.crypto &&
            typeof global.crypto.getRandomValues ===
            'function'
        ) {

            /*
             * Current engine only calls this function
             * with small safe ranges.
             */

            if (
                range <=
                UINT32_SPACE
            ) {

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

        }


        /*
         * Fallback.
         *
         * This path is used only for small safe ranges.
         */

        return (
            min +
            Math.floor(
                Math.random() *
                range
            )
        );

    }


    /* =========================================================================
     * DIGIT HELPERS
     * ========================================================================= */

    function digitsOf(
        value,
        width
    ) {

        const n =
            absBigInt(
                value
            );


        const text =
            n.toString();


        if (
            text.length >
            width
        ) {

            return null;

        }


        return text
            .padStart(
                width,
                '0'
            )
            .split('')
            .map(
                Number
            );

    }


    function numberFromDigits(
        digits
    ) {

        if (
            !Array.isArray(digits) ||
            !digits.length
        ) {

            throw new Error(
                'Invalid digit array.'
            );

        }


        return BigInt(
            digits.join('')
        );

    }


    function cloneDigits(
        digits
    ) {

        return digits.slice();

    }


    /* =========================================================================
     * RANDOM OPERAND
     * ========================================================================= */

    function randomOperand(
        digits
    ) {

        if (
            !Number.isInteger(digits) ||
            digits < 1 ||
            digits > 15
        ) {

            throw new Error(
                'Invalid operand digit count.'
            );

        }


        /*
         * First digit:
         *
         * 1..9
         */

        let result =
            secureRandomInt(
                1,
                9
            ).toString();


        /*
         * Remaining digits:
         *
         * 0..9
         */

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


    /* =========================================================================
     * OPERATION SIGN VALIDATION
     * =========================================================================
     *
     * This is intentionally kept separate from Soroban technique validation.
     *
     * The operation mode determines which signs are legal:
     *
     * addition:
     *     positive terms only
     *
     * subtraction:
     *     negative terms only
     *
     * mixed:
     *     positive or negative terms
     *
     * Zero is not an operation and is therefore rejected.
     * ========================================================================= */

    function operandFitsDisplayedDigits(value, digits) {
        const magnitude = absBigInt(value);
        const min = 10n ** BigInt(digits - 1);
        const max = (10n ** BigInt(digits)) - 1n;
        return magnitude >= min && magnitude <= max;
    }


    function validateOperationSign(
        term,
        operation
    ) {

        let value;


        try {

            value =
                toBigInt(
                    term
                );

        }
        catch (
            error
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.INVALID_INTEGER

            };

        }


        if (
            value === 0n
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.OPERATION_SIGN_MISMATCH

            };

        }


        switch (
            operation
        ) {

            case OPERATIONS.ADDITION:

                if (
                    value <= 0n
                ) {

                    return {

                        valid:
                            false,

                        reason:
                            REASONS.OPERATION_SIGN_MISMATCH

                    };

                }

                break;


            case OPERATIONS.SUBTRACTION:

                if (
                    value >= 0n
                ) {

                    return {

                        valid:
                            false,

                        reason:
                            REASONS.OPERATION_SIGN_MISMATCH

                    };

                }

                break;


            case OPERATIONS.MIXED:

                /*
                 * Both signs are legal.
                 *
                 * Zero was already rejected above.
                 */

                break;


            default:

                return {

                    valid:
                        false,

                    reason:
                        REASONS.INVALID_CONFIG

                };

        }


        return {

            valid:
                true,

            value

        };

    }


    /* =========================================================================
     * SOROBAN TECHNIQUE CLASSIFICATION
     * =========================================================================
     *
     * The important distinction is not simply:
     *
     *     "Can arithmetic calculate this?"
     *
     * but:
     *
     *     "Can this digit transition be performed using
     *      the selected Soroban technique class?"
     *
     * We classify each LOCAL digit transition.
     * Carry / borrow transitions are classified separately.
     * ========================================================================= */


    /*
     * -------------------------------------------------------------------------
     * ADDITION CLASSIFIER
     * -------------------------------------------------------------------------
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
         * ---------------------------------------------------------------
         * Current digit 0..4
         * ---------------------------------------------------------------
         */

        if (
            d <= 4
        ) {

            /*
             * Pure earth-bead addition.
             */

            if (
                x <= 4 &&
                d + x <= 4
            ) {

                return TECHNIQUES.DIRECT;

            }


            /*
             * Add heaven bead.
             *
             * Example:
             *
             *     2 + 5 = 7
             */

            if (
                x === 5
            ) {

                return TECHNIQUES.DIRECT;

            }


            /*
             * Add heaven bead + earth beads.
             *
             * Example:
             *
             *     2 + 6 = 8
             *
             * represented as:
             *
             *     +5 +1
             */

            if (
                x > 5 &&
                d + (x - 5) <= 4
            ) {

                return TECHNIQUES.DIRECT;

            }


            /*
             * 5-complement.
             */

            if (
                x <= 4 &&
                d + x <= 9
            ) {

                return TECHNIQUES.F5;

            }

        }


        /*
         * ---------------------------------------------------------------
         * Current digit 5..9
         * ---------------------------------------------------------------
         */

        else {

            const earth =
                d - 5;


            /*
             * Enough earth beads remain.
             */

            if (
                x <= 4 &&
                earth + x <= 4
            ) {

                return TECHNIQUES.DIRECT;

            }


            /*
             * Otherwise adding 1..4 requires
             * a 5-complement.
             */

            if (
                x <= 4 &&
                d + x <= 9
            ) {

                return TECHNIQUES.F5;

            }

        }


        /*
         * ---------------------------------------------------------------
         * Carry / 10-complement
         * ---------------------------------------------------------------
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


            /*
             * If the complement itself requires F5,
             * the transition combines F5 with F10.
             */

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
     * -------------------------------------------------------------------------
     * SUBTRACTION CLASSIFIER
     * -------------------------------------------------------------------------
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
         * ---------------------------------------------------------------
         * Current digit 0..4
         * ---------------------------------------------------------------
         */

        if (
            d <= 4
        ) {

            /*
             * Pure earth-bead subtraction.
             */

            if (
                x <= 4 &&
                d >= x
            ) {

                return TECHNIQUES.DIRECT;

            }


            /*
             * Borrow / 10-complement is required.
             */

            return TECHNIQUES.F10;

        }


        /*
         * ---------------------------------------------------------------
         * Current digit 5..9
         * ---------------------------------------------------------------
         */

        const earth =
            d - 5;


        /*
         * Remove heaven bead directly.
         */

        if (
            x === 5
        ) {

            return TECHNIQUES.DIRECT;

        }


        /*
         * Remove heaven bead + earth beads.
         */

        if (
            x > 5 &&
            d >= x
        ) {

            return TECHNIQUES.DIRECT;

        }


        /*
         * Enough earth beads available.
         */

        if (
            x <= 4 &&
            earth >= x
        ) {

            return TECHNIQUES.DIRECT;

        }


        /*
         * 5-complement subtraction.
         */

        if (
            x <= 4 &&
            d >= x
        ) {

            return TECHNIQUES.F5;

        }


        /*
         * Borrow / 10-complement.
         */

        return TECHNIQUES.F10;

    }


    /* =========================================================================
     * APPLY ADDITION
     * ========================================================================= */

    function applyAddition(
        stateDigits,
        operandDigits
    ) {

        const digits =
            cloneDigits(
                stateDigits
            );


        const width =
            digits.length;


        const techniques =
            [];


        /*
         * Process least significant column first.
         */

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
             * -------------------------------------------------------------
             * No carry
             * -------------------------------------------------------------
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
             * -------------------------------------------------------------
             * Carry
             * -------------------------------------------------------------
             */

            digits[i] =
                d +
                x -
                10;


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
                        previous +
                        1;


                    techniques.push(
                        carryClass
                    );


                    break;

                }


                /*
                 * 9 + 1 = 0 with carry.
                 */

                digits[j] =
                    0;


                techniques.push(
                    carryClass
                );


                j--;

            }


            /*
             * No column available for carry.
             */

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


    /* =========================================================================
     * APPLY SUBTRACTION
     * ========================================================================= */

    function applySubtraction(
        stateDigits,
        operandDigits
    ) {

        const digits =
            cloneDigits(
                stateDigits
            );


        const width =
            digits.length;


        const techniques =
            [];


        /*
         * Process least significant column first.
         */

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
             * -------------------------------------------------------------
             * Direct local subtraction.
             * -------------------------------------------------------------
             */

            if (
                d >= x
            ) {

                const classification =
                    classifySubDigit(
                        d,
                        x
                    );


                digits[i] =
                    d -
                    x;


                techniques.push(
                    classification
                );


                continue;

            }


            /*
             * -------------------------------------------------------------
             * Borrow required.
             * -------------------------------------------------------------
             */

            let j =
                i - 1;


            /*
             * Zero columns become 9.
             *
             * This is a 10-complement chain.
             */

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


            /*
             * No source column.
             */

            if (
                j < 0
            ) {

                return null;

            }


            const previous =
                digits[j];


            if (
                previous <= 0
            ) {

                return null;

            }


            const previousClass =
                classifySubDigit(
                    previous,
                    1
                );


            digits[j] =
                previous -
                1;


            techniques.push(
                previousClass
            );


            /*
             * Current digit receives:
             *
             *     10 - x
             *
             * after borrowing 1 from the next column.
             */

            const complement =
                10 -
                x;


            const addClass =
                classifyAddDigit(
                    d,
                    complement
                );


            /*
             * Borrow is inherently a 10-complement operation.
             *
             * If the local addition also needs F5,
             * classify the transition as MIX.
             */

            if (
                addClass ===
                TECHNIQUES.F5
            ) {

                techniques.push(
                    TECHNIQUES.MIX
                );

            }
            else {

                techniques.push(
                    TECHNIQUES.F10
                );

            }


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


    /* =========================================================================
     * GENERIC OPERATION
     * ========================================================================= */

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


    /* =========================================================================
     * TECHNIQUE FLAGS
     * ========================================================================= */

    function containsF5(
        techniques
    ) {

        return techniques.some(
            technique =>
                technique ===
                TECHNIQUES.F5 ||
                technique ===
                TECHNIQUES.MIX
        );

    }


    function containsF10(
        techniques
    ) {

        return techniques.some(
            technique =>
                technique ===
                TECHNIQUES.F10 ||
                technique ===
                TECHNIQUES.MIX
        );

    }


    /*
     * Row-level technique policy. Skill requirements are enforced globally
     * by validateSequence()/generateSequence, not on every row.
     */
    function techniqueAllowed(level, technique) {
        switch (level) {
            case LEVELS.SIMPLE: return technique === TECHNIQUES.DIRECT;
            case LEVELS.F5: return technique === TECHNIQUES.DIRECT || technique === TECHNIQUES.F5;
            case LEVELS.F10: return technique === TECHNIQUES.DIRECT || technique === TECHNIQUES.F10;
            case LEVELS.MIX:
                return technique === TECHNIQUES.DIRECT || technique === TECHNIQUES.F5 ||
                    technique === TECHNIQUES.F10 || technique === TECHNIQUES.MIX;
            default: return false;
        }
    }

    function techniquesAllowed(level, techniques) {
        return Array.isArray(techniques) && techniques.every(t => techniqueAllowed(level, t));
    }

    function levelRequirementSatisfied(level, hasF5, hasF10) {
        switch (level) {
            case LEVELS.SIMPLE: return true;
            case LEVELS.F5: return !!hasF5;
            case LEVELS.F10: return !!hasF10;
            case LEVELS.MIX: return !!hasF5 && !!hasF10;
            default: return false;
        }
    }


    /* =========================================================================
     * CONFIGURATION
     * ========================================================================= */

    function validateConfig(
        raw
    ) {

        const config =
            Object.assign(

                {

                    digits:
                        2,

                    rows:
                        4,

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


        /*
         * digits
         */

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


        /*
         * rows
         */

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


        /*
         * operation
         */

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


        /*
         * level
         */

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


        /*
         * Negative-state support is intentionally disabled
         * in this engine version.
         *
         * The current Soroban state representation uses
         * non-negative rods. Therefore silently accepting
         * allowNegative=true would be misleading.
         */

        if (
            config.allowNegative !==
            false
        ) {

            throw new Error(
                'allowNegative is not supported by Soroban Engine v3. Use false.'
            );

        }


        /*
         * generation attempts
         */

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


        /*
         * candidates
         */

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
         * Internal width.
         *
         * We intentionally reserve several additional
         * columns for cumulative carry.
         */

        config.internalWidth =
            config.digits +
            Math.ceil(
                Math.log10(
                    config.rows + 1
                )
            ) +
            3;


        return config;

    }


    /* =========================================================================
     * INITIAL STATE
     * ========================================================================= */

    function chooseInitial(
        config
    ) {

        return randomOperand(
            config.digits
        );

    }


    /* =========================================================================
     * OPERATION SIGNS
     * ========================================================================= */

    function operationSigns(
        operation
    ) {

        switch (
            operation
        ) {

            case OPERATIONS.ADDITION:

                return [1];


            case OPERATIONS.SUBTRACTION:

                return [-1];


            case OPERATIONS.MIXED:

                return [1, -1];


            default:

                return [];

        }

    }


    function candidateSigns(
        config
    ) {

        const signs =
            operationSigns(
                config.operation
            );


        if (
            signs.length <= 1
        ) {

            return signs;

        }


        /*
         * Randomize order while still testing both signs.
         */

        return secureRandomInt(
            0,
            1
        ) === 0
            ? [1, -1]
            : [-1, 1];

    }


    /* =========================================================================
     * VALIDATE ONE TRANSITION
     * ========================================================================= */

    function validateOperation(
        current,
        term,
        config
    ) {

        let normalizedConfig;


        try {

            normalizedConfig =
                validateConfig(
                    config
                );

        }
        catch (
            error
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.INVALID_CONFIG,

                error:
                    error.message

            };

        }


        let currentBig;


        try {

            currentBig =
                toBigInt(
                    current
                );

        }
        catch (
            error
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.INVALID_INTEGER

            };

        }


        /*
         * ---------------------------------------------------------------
         * OPERATION SIGN CONTRACT
         * ---------------------------------------------------------------
         *
         * This must happen before the arithmetic engine sees the term.
         */

        const signCheck =
            validateOperationSign(
                term,
                normalizedConfig.operation
            );


        if (
            !signCheck.valid
        ) {

            return {

                valid:
                    false,

                reason:
                    signCheck.reason

            };

        }


        const normalizedTerm =
            signCheck.value;


        if (!operandFitsDisplayedDigits(normalizedTerm, normalizedConfig.digits)) {
            return {
                valid: false,
                reason: REASONS.OPERAND_OVERFLOW
            };
        }


        /*
         * State cannot already be negative.
         */

        if (
            currentBig < 0n
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.NEGATIVE_STATE

            };

        }


        /*
         * Current state must fit the internal rods.
         */

        const state =
            digitsOf(
                currentBig,
                normalizedConfig.internalWidth
            );


        if (!state) {

            return {

                valid:
                    false,

                reason:
                    REASONS.STATE_OVERFLOW

            };

        }


        let applied;


        try {

            applied =
                applyOperation(
                    state,
                    normalizedTerm
                );

        }
        catch (
            error
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.SOROBAN_TRANSITION_INVALID,

                error:
                    error.message

            };

        }


        if (!applied) {

            return {

                valid:
                    false,

                reason:
                    REASONS.SOROBAN_TRANSITION_INVALID

            };

        }


        /*
         * Negative result protection.
         */

        if (
            applied.value < 0n
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.NEGATIVE_RESULT

            };

        }


        /*
         * Technique gate.
         */

        if (
            !techniquesAllowed(
                normalizedConfig.level,
                applied.techniques
            )
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.LEVEL_RULE_MISMATCH,

                techniques:
                    applied.techniques

            };

        }


        return {

            valid:
                true,

            value:
                applied.value,

            valueString:
                formatBigInt(
                    applied.value
                ),

            techniques:
                applied.techniques,

            hasF5:
                containsF5(
                    applied.techniques
                ),

            hasF10:
                containsF10(
                    applied.techniques
                )

        };

    }


    /* =========================================================================
     * TRANSITION EXPLANATION
     * ========================================================================= */

    function explainTransition(
        current,
        term,
        config
    ) {

        const normalizedConfig =
            validateConfig(
                config
            );


        const result =
            validateOperation(
                current,
                term,
                normalizedConfig
            );


        return {

            current:
                toBigInt(
                    current
                ),

            currentString:
                formatBigInt(
                    current
                ),

            term:
                toBigInt(
                    term
                ),

            termString:
                formatBigInt(
                    term
                ),

            valid:
                result.valid,

            reason:
                result.reason ||
                null,

            value:
                result.valid
                    ? result.value
                    : null,

            valueString:
                result.valid
                    ? result.valueString
                    : null,

            techniques:
                result.techniques ||
                [],

            hasF5:
                result.hasF5 ||
                false,

            hasF10:
                result.hasF10 ||
                false

        };

    }


    /* =========================================================================
     * SEQUENCE VALIDATION
     * =========================================================================
     *
     * Validates a complete externally supplied sequence.
     *
     * Example:
     *
     *     validateSequence(
     *         [123, 45, 12, 8],
     *         config
     *     );
     *
     * The first number is the initial state.
     * Every subsequent number is treated as an operation.
     *
     * For operation modes:
     *
     * addition:
     *     subsequent terms must be positive
     *
     * subtraction:
     *     subsequent terms must be negative
     *
     * mixed:
     *     subsequent terms may be positive or negative
     * ========================================================================= */

    function validateSequence(
        terms,
        rawConfig
    ) {

        let config;


        try {

            config =
                validateConfig(
                    rawConfig
                );

        }
        catch (
            error
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.INVALID_CONFIG,

                error:
                    error.message

            };

        }


        if (
            !Array.isArray(
                terms
            ) ||
            terms.length < 1
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.EMPTY_SEQUENCE

            };

        }


        if (
            terms.length !==
            config.rows
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.ROW_COUNT_MISMATCH

            };

        }


        let normalizedTerms;


        try {

            normalizedTerms =
                terms.map(
                    value =>
                        toBigInt(
                            value
                        )
                );

        }
        catch (
            error
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.INVALID_INTEGER,

                error:
                    error.message

            };

        }


        /*
         * First term is the initial state.
         *
         * It must be a positive initial number.
         */

        let current =
            normalizedTerms[0];


        if (
            current <= 0n
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.NEGATIVE_STATE

            };

        }


        if (!operandFitsDisplayedDigits(current, config.digits)) {
            return {
                valid: false,
                reason: REASONS.OPERAND_OVERFLOW
            };
        }


        const stateTrace =
            [current];


        const techniqueTrace =
            [];


        let hasF5 =
            false;


        let hasF10 =
            false;


        for (
            let i = 1;
            i < normalizedTerms.length;
            i++
        ) {

            const term =
                normalizedTerms[i];


            /*
             * validateOperation() validates:
             *
             * 1. operation sign
             * 2. current state
             * 3. Soroban transition
             * 4. negative result
             * 5. selected technique level
             */

            const check =
                validateOperation(
                    current,
                    term,
                    config
                );


            if (
                !check.valid
            ) {

                return {

                    valid:
                        false,

                    reason:
                        check.reason,

                    failedRow:
                        i,

                    current,

                    term,

                    stateTrace,

                    techniqueTrace

                };

            }


            current =
                check.value;


            stateTrace.push(
                current
            );


            techniqueTrace.push(
                check.techniques
            );


            hasF5 =
                hasF5 ||
                check.hasF5;


            hasF10 =
                hasF10 ||
                check.hasF10;

        }


        /*
         * Independent arithmetic verification.
         *
         * The initial state is included as the first term.
         */

        const independentAnswer =
            normalizedTerms.reduce(
                (
                    sum,
                    value
                ) =>
                    sum +
                    value,
                0n
            );


        if (
            independentAnswer !==
            current
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.FINAL_STATE_MISMATCH,

                stateTrace,

                techniqueTrace,

                current,

                independentAnswer

            };

        }


        /*
         * Required skill verification.
         */

        if (
            config.level ===
            LEVELS.F5 &&
            !hasF5
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.TECHNIQUE_REQUIREMENT,

                required:
                    TECHNIQUES.F5,

                stateTrace,

                techniqueTrace

            };

        }


        if (
            config.level ===
            LEVELS.F10 &&
            !hasF10
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.TECHNIQUE_REQUIREMENT,

                required:
                    TECHNIQUES.F10,

                stateTrace,

                techniqueTrace

            };

        }


        if (
            config.level ===
            LEVELS.MIX &&
            (
                !hasF5 ||
                !hasF10
            )
        ) {

            return {

                valid:
                    false,

                reason:
                    REASONS.TECHNIQUE_REQUIREMENT,

                required:
                    'f5_and_f10',

                stateTrace,

                techniqueTrace

            };

        }


        return {

            valid:
                true,

            terms:
                normalizedTerms,

            answer:
                independentAnswer,

            answerString:
                independentAnswer.toString(),

            finalValue:
                current,

            finalValueString:
                current.toString(),

            stateTrace,

            techniqueTrace,

            hasF5,

            hasF10

        };

    }


    /* =========================================================================
     * CANDIDATE SCORING
     * ========================================================================= */

    function scoreCandidate(
        candidate,
        config,
        hasF5,
        hasF10
    ) {

        let score =
            0;


        const rowHasF5 =
            candidate.hasF5;


        const rowHasF10 =
            candidate.hasF10;


        /*
         * Strongly prioritize missing skills.
         */

        if (
            config.level ===
            LEVELS.MIX
        ) {

            if (
                !hasF5 &&
                rowHasF5
            ) {

                score += 100;

            }


            if (
                !hasF10 &&
                rowHasF10
            ) {

                score += 100;

            }


            /*
             * Bonus for a row containing
             * both characteristics.
             */

            if (
                rowHasF5 &&
                rowHasF10
            ) {

                score += 25;

            }

        }


        if (
            config.level ===
            LEVELS.F5 &&
            rowHasF5
        ) {

            score += 50;

        }


        if (
            config.level ===
            LEVELS.F10 &&
            rowHasF10
        ) {

            score += 50;

        }


        /*
         * Mild preference for complexity.
         */

        score +=
            candidate.techniques.length;


        return score;

    }


    function stateFlexibility(value, config) {
        let digits;
        try { digits = digitsOf(value, config.internalWidth); } catch (error) { return 0; }
        const first = config.internalWidth - config.digits;
        let score = 0;
        for (let i = first; i < config.internalWidth; i++) {
            const d = digits[i];
            for (let x = 1; x <= 9; x++) {
                if (config.operation === OPERATIONS.SUBTRACTION) {
                    if (d >= x && techniqueAllowed(config.level, classifySubDigit(d, x))) score++;
                } else if (config.operation === OPERATIONS.ADDITION) {
                    if (d + x <= 9 && techniqueAllowed(config.level, classifyAddDigit(d, x))) score++;
                } else {
                    if (d + x <= 9 && techniqueAllowed(config.level, classifyAddDigit(d, x))) score++;
                    if (d >= x && techniqueAllowed(config.level, classifySubDigit(d, x))) score++;
                }
            }
        }
        return score;
    }

    function randomizeArray(values) {
        const out = values.slice();
        for (let i = out.length - 1; i > 0; i--) {
            const j = secureRandomInt(0, i);
            [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
    }

    function applyConstructiveColumn(stateDigits, index, x, operation, level, techniques) {
        const digits = cloneDigits(stateDigits);
        const trace = techniques.slice();
        if (x === 0) return { digits, techniques: trace };
        const d = digits[index];
        if (operation === OPERATIONS.ADDITION) {
            const classification = classifyAddDigit(d, x);
            if (!techniqueAllowed(level, classification)) return null;
            if (d + x <= 9) {
                digits[index] = d + x;
                trace.push(classification);
                return { digits, techniques: trace };
            }
            digits[index] = d + x - 10;
            trace.push(classification);
            for (let j = index - 1; j >= 0; j--) {
                const previous = digits[j];
                const carryClass = classifyAddDigit(previous, 1);
                if (!techniqueAllowed(level, carryClass)) return null;
                digits[j] = previous < 9 ? previous + 1 : 0;
                trace.push(carryClass);
                if (previous < 9) return { digits, techniques: trace };
            }
            return null;
        }
        if (d >= x) {
            const classification = classifySubDigit(d, x);
            if (!techniqueAllowed(level, classification)) return null;
            digits[index] = d - x;
            trace.push(classification);
            return { digits, techniques: trace };
        }
        let j = index - 1;
        while (j >= 0 && digits[j] === 0) {
            if (!techniqueAllowed(level, TECHNIQUES.F10)) return null;
            digits[j] = 9;
            trace.push(TECHNIQUES.F10);
            j--;
        }
        if (j < 0) return null;
        const previous = digits[j];
        const previousClass = classifySubDigit(previous, 1);
        if (!techniqueAllowed(level, previousClass)) return null;
        digits[j] = previous - 1;
        trace.push(previousClass);
        const complement = 10 - x;
        const addClass = classifyAddDigit(d, complement);
        const borrowClass = addClass === TECHNIQUES.F5 ? TECHNIQUES.MIX : TECHNIQUES.F10;
        if (!techniqueAllowed(level, borrowClass)) return null;
        trace.push(borrowClass);
        digits[index] = d + complement;
        return { digits, techniques: trace };
    }

    function constructCandidate(current, sign, config, hasF5, hasF10, rowIndex) {
        const minimumOperand = 10n ** BigInt(config.digits - 1);
        const baselineTerm = sign === 1 ? minimumOperand : -minimumOperand;
        const baselineCheck = validateOperation(current, baselineTerm, config);

        if (
            baselineCheck.valid &&
            candidateFutureFeasible(baselineCheck.value, rowIndex, config) &&
            levelRequirementSatisfied(
                config.level,
                hasF5 || baselineCheck.hasF5,
                hasF10 || baselineCheck.hasF10
            )
        ) {
            return {
                term: baselineTerm,
                value: baselineCheck.value,
                techniques: baselineCheck.techniques,
                hasF5: baselineCheck.hasF5,
                hasF10: baselineCheck.hasF10,
                priority: scoreCandidate(baselineCheck, config, hasF5, hasF10) + 1000
            };
        }

        const width = config.internalWidth;
        const first = width - config.digits;
        let beam = [{ digits: digitsOf(current, width), operand: Array(width).fill(0), techniques: [], score: 0 }];
        for (let i = width - 1; i >= first; i--) {
            const choices = randomizeArray(i === first ? [1,2,3,4,5,6,7,8,9] : [0,1,2,3,4,5,6,7,8,9]);
            const next = [];
            for (const state of beam) {
                for (const x of choices) {
                    const applied = applyConstructiveColumn(state.digits, i, x, sign === 1 ? OPERATIONS.ADDITION : OPERATIONS.SUBTRACTION, config.level, state.techniques);
                    if (!applied) continue;
                    const operand = state.operand.slice(); operand[i] = x;
                    const rowHasF5 = containsF5(applied.techniques);
                    const rowHasF10 = containsF10(applied.techniques);
                    const score =
                        (config.level === LEVELS.F5 && !hasF5 && rowHasF5 ? 1000 : 0) +
                        (config.level === LEVELS.F10 && !hasF10 && rowHasF10 ? 1000 : 0) +
                        (config.level === LEVELS.MIX && !hasF5 && rowHasF5 ? 1000 : 0) +
                        (config.level === LEVELS.MIX && !hasF10 && rowHasF10 ? 1000 : 0) +
                        (rowHasF5 ? 20 : 0) + (rowHasF10 ? 20 : 0) + secureRandomInt(0, 50);
                    next.push({ digits: applied.digits, operand, techniques: applied.techniques, score });
                }
            }
            if (!next.length) return null;
            next.sort((a,b) => b.score - a.score);
            beam = next.slice(0, Math.min(16, next.length));
        }
        for (const state of beam.slice(0, 8)) {
            const magnitude = numberFromDigits(state.operand.slice(first));
            if (magnitude <= 0n) continue;
            const term = sign === 1 ? magnitude : -magnitude;
            const check = validateOperation(current, term, config);
            if (!check.valid) continue;
            if (!candidateFutureFeasible(check.value, rowIndex, config)) continue;
            return {
                term, value: check.value, techniques: check.techniques,
                hasF5: check.hasF5, hasF10: check.hasF10,
                priority: scoreCandidate(check, config, hasF5, hasF10) + stateFlexibility(check.value, config) * 0.25
            };
        }
        return null;
    }


    function candidateFutureFeasible(value, rowIndex, config) {
        if (config.operation === OPERATIONS.SUBTRACTION) {
            const minOperand = 10n ** BigInt(config.digits - 1);
            const remainingOperations = BigInt(config.rows - rowIndex - 1);
            return value >= remainingOperations * minOperand;
        }

        return true;
    }


    /* =========================================================================
     * GENERATE SEQUENCE
     * ========================================================================= */

    function generateSequence(
        rawConfig
    ) {

        let config;


        try {

            config =
                validateConfig(
                    rawConfig
                );

        }
        catch (
            error
        ) {

            throw new Error(
                error.message
            );

        }


        if (
            config.rows < 2 &&
            config.level !== LEVELS.SIMPLE
        ) {
            throw new Error(
                'rows must be at least 2 for f5, f10, or mix levels.'
            );
        }

        if (
            config.digits === 1 &&
            config.operation === OPERATIONS.SUBTRACTION &&
            (config.level === LEVELS.F10 || config.level === LEVELS.MIX)
        ) {
            throw new Error(
                'One-digit subtraction cannot demonstrate F10 when negative results are disabled.'
            );
        }


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


            let hasF5 =
                false;


            let hasF10 =
                false;


            let failed =
                false;


            /*
             * -------------------------------------------------------------
             * Generate each row.
             * -------------------------------------------------------------
             */

            for (
                let row = 1;
                row < config.rows;
                row++
            ) {

                const candidates =
                    [];


                const signs =
                    candidateSigns(
                        config
                    );


                for (
                    const sign
                    of signs
                ) {

                    const constructed = constructCandidate(current, sign, config, hasF5, hasF10, row);
                    if (constructed) candidates.push(constructed);

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


                        /*
                         * Explicit sign gate.
                         *
                         * This is defensive because candidateSigns()
                         * already follows config.operation.
                         */

                        const signCheck =
                            validateOperationSign(
                                term,
                                config.operation
                            );


                        if (
                            !signCheck.valid
                        ) {

                            continue;

                        }


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

                        if (!candidateFutureFeasible(check.value, row, config)) {
                            continue;
                        }


                        const candidate = {

                            term,

                            value:
                                check.value,

                            techniques:
                                check.techniques,

                            hasF5:
                                check.hasF5,

                            hasF10:
                                check.hasF10,

                            priority:
                                0

                        };


                        candidate.priority =
                        scoreCandidate(candidate, config, hasF5, hasF10) +
                        stateFlexibility(candidate.value, config) * 0.25;


                    candidates.push(
                            candidate
                        );

                    }

                }


                if (
                    !candidates.length
                ) {

                    failed =
                        true;

                    break;

                }


                /*
                 * Highest priority first.
                 */

                candidates.sort(
                    (
                        a,
                        b
                    ) =>
                        b.priority -
                        a.priority
                );


                /*
                 * Do not always take the absolute
                 * best candidate.
                 *
                 * Select from the elite pool to retain
                 * variation between generated challenges.
                 */

                const eliteSize =
                    Math.min(
                        20,
                        candidates.length
                    );


                const elite =
                    candidates.slice(
                        0,
                        eliteSize
                    );


                const chosen =
                    elite[
                        secureRandomInt(
                            0,
                            elite.length - 1
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


                hasF5 =
                    hasF5 ||
                    chosen.hasF5;


                hasF10 =
                    hasF10 ||
                    chosen.hasF10;

            }


            if (
                failed
            ) {

                continue;

            }


            /*
             * -------------------------------------------------------------
             * Required level skills.
             * -------------------------------------------------------------
             */

            if (!levelRequirementSatisfied(config.level, hasF5, hasF10)) {
                continue;
            }


            /*
             * -------------------------------------------------------------
             * Independent final calculation.
             * -------------------------------------------------------------
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
             * Absolute integrity check.
             */

            if (
                answer !==
                current
            ) {

                continue;

            }


            /*
             * Negative protection.
             */

            if (
                answer < 0n
            ) {

                continue;

            }


            /*
             * -------------------------------------------------------------
             * SECOND-PASS VALIDATION
             * -------------------------------------------------------------
             *
             * The generated sequence is passed through the external
             * validator again.
             */

            const verification =
                validateSequence(
                    terms,
                    config
                );


            if (
                !verification.valid
            ) {

                continue;

            }


            /*
             * -------------------------------------------------------------
             * FINAL IMMUTABLE RESULT
             * -------------------------------------------------------------
             */

            return {

                version:
                    VERSION,

                terms,

                termsString:
                    terms.map(
                        formatBigInt
                    ),

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
                    false,

                techniqueTrace,

                stateTrace,

                hasF5,

                hasF10

            };

        }


        throw new Error(

            'تعذر توليد تحدٍ صالح بهذه الإعدادات دون كسر قواعد السوروبان. ' +

            'جرّب تقليل عدد الصفوف أو تغيير العملية أو المستوى أو زيادة ' +

            'maxGenerationAttempts / candidatesPerRow.'

        );

    }


    /* =========================================================================
     * DISPLAY
     * ========================================================================= */

    function formatTerm(
        term
    ) {

        const value =
            toBigInt(
                term
            );


        return value < 0n

            ? `−${absBigInt(value)}`

            : `${value}`;

    }


    function toDisplay(
        sequence
    ) {

        if (
            !sequence ||
            !Array.isArray(
                sequence.terms
            )
        ) {

            throw new Error(
                'Invalid sequence.'
            );

        }


        return sequence
            .terms
            .map(
                formatTerm
            )
            .join(
                '  '
            );

    }


    /* =========================================================================
     * SERIALIZABLE RESULT
     * =========================================================================
     *
     * BigInt cannot be JSON.stringify()-ed directly.
     *
     * This helper creates a JSON-safe representation.
     */

    function toJSON(
        sequence
    ) {

        if (
            !sequence
        ) {

            return null;

        }


        const output =
            Object.assign(
                {},
                sequence
            );


        if (
            Array.isArray(
                output.terms
            )
        ) {

            output.terms =
                output.terms.map(
                    value =>
                        toBigInt(
                            value
                        ).toString()
                );

        }


        if (
            Array.isArray(
                output.stateTrace
            )
        ) {

            output.stateTrace =
                output.stateTrace.map(
                    value =>
                        toBigInt(
                            value
                        ).toString()
                );

        }


        if (
            typeof output.answer ===
            'bigint'
        ) {

            output.answer =
                output.answer.toString();

        }


        if (
            typeof output.finalValue ===
            'bigint'
        ) {

            output.finalValue =
                output.finalValue.toString();

        }


        return output;

    }


    /* =========================================================================
     * PUBLIC API
     * ========================================================================= */

    const API =
        Object.freeze({

            VERSION,

            LEVELS,

            OPERATIONS,

            TECHNIQUES,

            REASONS,

            validateConfig,

            validateOperationSign,

            validateOperation,

            validateSequence,

            explainTransition,

            generateSequence,

            toDisplay,

            toJSON

        });


    /*
     * Public global namespace.
     */

    global.MizanAnzanSoroban =
        API;


})(window);