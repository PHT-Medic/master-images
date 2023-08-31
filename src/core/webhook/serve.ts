/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Router, send } from 'routup';
import { createJsonHandler } from '@routup/body';
import { spawnCLIProcess } from '../../commands/utils/spawn';
import type { Config } from '../../config';
import { verifyWebhookRequestSignature } from './verify';

export async function serveWebhook(
    config: Config,
) : Promise<void> {
    const router = new Router();

    const execute = async () => {
        await spawnCLIProcess(config, 'build');
        await spawnCLIProcess(config, 'push');
    };

    router.use(createJsonHandler());

    router.use('/', async (req, res) => {
        if (!verifyWebhookRequestSignature(req, config)) {
            res.statusCode = 400;

            send(res, {
                success: false,
                message: 'The request signature could not be detected or verified.',
            });

            return;
        }

        await execute();

        send(res, { success: true });
    });

    router.listen(config.get('port'));
}
