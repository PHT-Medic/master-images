/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Command } from 'cac';
import type { Config } from '../../config';
import type { VersionTag } from '../../constants';
import type { CLICommandOptions } from '../type';

export function setCLICommandOptions(command: Command) : Command {
    return command
        .option('--root <root>', 'Set the root directory path')
        .option('--tag <tag>', 'Set the tag')
        .option('--registry <registry>', 'Set the registry connection string')
        .option('--registryHost <registryHost>', 'Set the registry host')
        .option('--registryPath <registryPath>', 'Set the registry path')
        .option('--registryUser <registryUser>', 'Set the registry user')
        .option('--registryPassword <registryPassword>', 'Set the registry password');
}

export function applyCLICommandOptions(config: Config, options: CLICommandOptions) {
    if (options.tag) {
        config.set('tag', options.tag as VersionTag);
    }

    if (options.registry) {
        // todo: parse registry (user:password@host/path)
    }

    if (options.registryHost) {
        config.set('registryHost', options.registryHost);
    }

    if (options.registryPath) {
        config.set('registryPath', options.registryPath);
    }

    if (options.registryUser) {
        config.set('registryUser', options.registryUser);
    }

    if (options.registryPassword) {
        config.set('registryPassword', options.registryPassword);
    }
}
