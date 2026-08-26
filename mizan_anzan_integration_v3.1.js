/*
 * MIZAN ANZAN — Engine v3.1 integration contract
 *
 * Load order:
 *   1) mizan_anzan_engine_v3.1.js
 *   2) this file (optional smoke check)
 *   3) app_mizan_anzan_v3.1.js
 */
(function (global) {
    'use strict';

    if (!global.MizanAnzanSoroban) {
        throw new Error(
            'MizanAnzanSoroban v3.1 must be loaded before the application.'
        );
    }

    if (global.MizanAnzanSoroban.VERSION !== '3.1.0') {
        throw new Error(
            `Unsupported Soroban engine version: ${global.MizanAnzanSoroban.VERSION}`
        );
    }

})(window);
