/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setConfig, useClient } from '@trapi/client';
import { ScanResult } from 'docker-scan';
import {
    MasterImageAPI,
    MasterImageCommand,
} from '@personalhealthtrain/central-common';
import { TokenAPI } from '@authelion/common';
import { Ora } from 'ora';
import { requireFromEnv } from './env';
import { parseConnectionString } from './connection-string';

export async function syncScanResultToCentralAPI(context: {
    scan: ScanResult,
    spinner: Ora
}) {
    context.spinner.start('Try to push meta information to central-api');

    try {
        const connection = parseConnectionString(requireFromEnv('CENTRAL_API_CONNECTION_STRING'));

        setConfig({
            driver: {
                baseURL: connection.host,
                withCredentials: true,
            },
        });

        const client = useClient();

        const tokenAPI = new TokenAPI(client.driver);
        const token = await tokenAPI.create({
            id: connection.user,
            secret: connection.password,
        });

        client
            .setAuthorizationHeader({
                type: 'Bearer',
                token: token.access_token,
            });

        const masterImageAPI = new MasterImageAPI(client.driver);
        await masterImageAPI.runCommand(MasterImageCommand.SYNC_PUSHED, context.scan);

        context.spinner.succeed('Push meta information to central-api succeeded.');
    } catch (e) {
        context.spinner.fail('Push meta information to central-api failed.');
    }
}
