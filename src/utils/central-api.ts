/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {ScanResult} from "docker-scan";
import {
    APIType,
    MasterImageCommand,
    parseHarborConnectionString,
    runAPITMasterImagesCommand,
    setAPIConfig,
    useAPI,
} from "@personalhealthtrain/ui-common";
import {requireFromEnv} from "./env";

export async function syncScanResultToCentralAPI(scanResult: ScanResult) {
    const connection = parseHarborConnectionString(requireFromEnv('CENTRAL_API_CONNECTION_STRING'));

    setAPIConfig(APIType.DEFAULT, {
        driver: {
            baseURL: connection.host,
            withCredentials: true
        }
    });

    useAPI(APIType.DEFAULT)
        .setAuthorizationHeader({
            type: 'Basic',
            username: connection.user,
            password: connection.password
        });

    await runAPITMasterImagesCommand(MasterImageCommand.SYNC_PUSHED, scanResult);
}
