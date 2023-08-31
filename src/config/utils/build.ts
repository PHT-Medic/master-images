/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Continu } from 'continu';
import zod from 'zod';
import { VersionTag } from '../../constants';
import type { Config, Options, OptionsInput } from '../type';

function transformHost(host: string) {
    if (
        host.startsWith('http://') ||
        host.startsWith('https://')
    ) {
        const parsed = new URL(host);
        return parsed.hostname;
    }

    return host;
}

export function buildConfig(input: OptionsInput) : Config {
    const instance = new Continu<Options, OptionsInput>({
        defaults: {
            port: 9000,
            tag: VersionTag.LATEST,
        },
        validators: {
            port: (value) => zod.number().safeParse(value),
            registryHost: (value) => zod.string().safeParse(value),
            registryPath: (value) => zod.string().safeParse(value),
            tag: (value) => zod.string().safeParse(value),
        },
        transformers: {
            registryHost(input) {
                return transformHost(`${input}`);
            },
        },
    });

    instance.setRaw(input);

    return instance;
}
