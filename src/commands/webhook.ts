/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CAC } from 'cac';
import { consola } from 'consola';
import { createConfig } from '../config';
import { serveWebhook } from '../core/webhook';
import type { CLICommandOptions } from './type';
import { setCLICommandOptions } from './utils';

export function registerCLIWebhookCommand(cli: CAC) {
    const command = cli
        .command('webhook', 'Run webhook');

    setCLICommandOptions(command);

    command
        .option('--port <port>', 'Set the default port')
        .option('--secret <secret>', 'Set the default secret')
        .action(async (
            options: CLICommandOptions & { port?: number, secret?: string },
        ) => {
            const config = await createConfig(options.root);

            if (options.port) {
                config.set('port', options.port);
            }

            if (options.secret) {
                config.set('secret', options.secret);
            }

            if (!config.has('registryHost')) {
                consola.error('Registry host must be defined.');
                process.exit(1);
            }

            if (!config.has('secret')) {
                consola.warn('A secret should be defined for better security.');
            }

            await serveWebhook(config);

            consola.success(`Listening on port 0.0.0.0:${config.get('port')}`);
        });
}
