/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { sync as spawnSync } from 'cross-spawn';
import type { Config, Options } from '../../config';
import { getPackageJsonVersionTag } from '../../utils';

export async function spawnCLIProcess(config: Config, command: string) {
    const tag = await getPackageJsonVersionTag();

    const args = [
        '--yes',
        `master-images@${tag}`,
        command,
        '--',
    ];

    const keys: (keyof Options)[] = [
        'registryHost',
        'registryPath',
        'registryUser',
        'registryPassword',
    ];

    for (let i = 0; i < keys.length; i++) {
        if (config.has(keys[i])) {
            args.push(...[
                `--${keys[i]}`,
                config.get(keys[i]) as string,
            ]);
        }
    }

    return spawnSync('npx', args, {
        cwd: process.cwd(),
        stdio: 'inherit',
    });
}
