/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Continu } from 'continu';
import type { VersionTag } from '../constants';

export type Options = {
    port: number,
    secret?: string,
    registryHost?: string,
    registryPath?: string,
    registryUser?: string,
    registryPassword?: string,
    tag?: `${VersionTag}`
};

export type OptionsInput = Partial<Options>;

export type Config = Continu<Options, OptionsInput>;
