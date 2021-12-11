"use strict";
/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFromEnv = void 0;
function requireFromEnv(key, alt) {
    var _a;
    if (!process.env[key] && typeof alt === 'undefined') {
        console.error('[APP ERROR] Missing env variable:' + key);
        return process.exit(1);
    }
    return (_a = process.env[key]) !== null && _a !== void 0 ? _a : alt;
}
exports.requireFromEnv = requireFromEnv;
//# sourceMappingURL=utils.js.map