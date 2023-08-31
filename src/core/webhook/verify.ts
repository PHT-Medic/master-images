/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createHash } from 'node:crypto';
import type { Request } from 'routup';
import { getRequestHeader } from 'routup';
import type { Config } from '../../config';

export function verifyWebhookRequest(req: Request, config: Config) : boolean {
    const secret = config.get('secret');
    if (!secret) {
        return true;
    }

    let header = getRequestHeader(req, 'X-Hub-Signature');
    if (typeof header === 'string') {
        const reqHash = header.replace('sha1=', '');
        const hash = createHash('sha1').update(secret).digest('hex');

        return reqHash === hash;
    }

    header = getRequestHeader(req, 'X-Hub-Signature-256');
    if (typeof header === 'string') {
        const reqHash = header.replace('sha256=', '');
        const hash = createHash('sha256').update(secret).digest('hex');

        return reqHash === hash;
    }

    return false;
}
