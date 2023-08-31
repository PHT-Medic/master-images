/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { consola } from 'consola';
import { createHmac } from 'crypto';
import type { Request } from 'routup';
import { getRequestHeader, useRequestBody } from 'routup';
import type { Config } from '../../config';

export function verifyWebhookRequestSignature(req: Request, config: Config) : boolean {
    const secret = config.get('secret');
    if (!secret) {
        return true;
    }

    const calculateHash = (algorithm: 'sha1' | 'sha256') => {
        const record : Record<string, any> = {};
        const keys = ['event', 'repository', 'commit', 'ref', 'head', 'workflow', 'requestID'];
        const keysMissing : string[] = [];
        for (let i = 0; i < keys.length; i++) {
            const value = useRequestBody(req, keys[i]);
            if (value) {
                record[keys[i]] = value;
            } else {
                keysMissing.push(keys[i]);
            }
        }

        if (keysMissing.length > 0) {
            consola.warn(`Request payload attributes ${keysMissing.join(', ')} is missing.`);
            return undefined;
        }

        const payload = JSON.stringify(record);

        return createHmac(algorithm, secret).update(payload).digest('hex');
    };

    let header = getRequestHeader(req, 'x-hub-signature');
    if (typeof header === 'string') {
        const reqHash = header.replace('sha1=', '');
        const hash = calculateHash('sha1');

        return reqHash === hash;
    }

    header = getRequestHeader(req, 'x-hub-signature-256');
    if (typeof header === 'string') {
        const reqHash = header.replace('sha256=', '');
        const hash = calculateHash('sha256');

        return reqHash === hash;
    }

    return false;
}
