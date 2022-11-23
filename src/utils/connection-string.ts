/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseError } from 'ebec';

export function parseConnectionString(connectionString: string): {
    host: string,
    user: string,
    password: string
} {
    const parts: string[] = connectionString.split('@');
    if (parts.length !== 2) {
        throw new BaseError('Connection string must be in the following format: user:password@host');
    }

    const host: string = parts[1];

    const authParts: string[] = parts[0].split(':');
    if (authParts.length !== 2) {
        throw new BaseError('Connection string must be in the following format: user:password@host');
    }

    return {
        host,
        user: authParts[0],
        password: authParts[1],
    };
}
