/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {setConfig, useClient} from "@trapi/client";
import {ScanResult} from "docker-scan";
import {MasterImageAPI, MasterImageCommand, parseHarborConnectionString,} from "@personalhealthtrain/ui-common";
import {requireFromEnv} from "./env";
import {OAuth2TokenGrant, TokenAPI} from "@typescript-auth/domains";

export async function syncScanResultToCentralAPI(scanResult: ScanResult) {
    const connection = parseHarborConnectionString(requireFromEnv('CENTRAL_API_CONNECTION_STRING'));

    setConfig( {
        driver: {
            baseURL: connection.host,
            withCredentials: true
        }
    });

    const client = useClient();

    const tokenAPI = new TokenAPI(client.driver);
    const token = await tokenAPI.create({
        id: connection.user,
        secret: connection.password,
        grant_type: OAuth2TokenGrant.ROBOT_CREDENTIALS
    })

    client
        .setAuthorizationHeader({
            type: 'Bearer',
            token: token.access_token
        });

    const masterImageAPI = new MasterImageAPI(client.driver);
    await masterImageAPI.runCommand(MasterImageCommand.SYNC_PUSHED, scanResult);
}
