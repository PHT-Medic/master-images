/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';

export enum RegistryEnv {
    HOST = 'CONTAINER_REGISTRY',
    USERNAME = 'REGISTRY_USERNAME',
    PASSWORD = 'REGISTRY_PASSWORD',
}

export const SCAN_IMAGE_PATH = path.join(
    __dirname,
    '..',
    'data',
);

export enum VersionTag {
    LATEST = 'latest',
    ALPHA = 'alpha',
    BETA = 'beta',
    NEXT = 'next',
}
