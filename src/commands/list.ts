/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CAC } from 'cac';
import { consola } from 'consola';
import { scanDirectory } from 'docker-scan';
import { SCAN_IMAGE_PATH } from '../constants';

export function registerCLIListCommand(cli: CAC) {
    cli
        .command('list', 'List all images')
        .action(async () => {
            const scanResult = await scanDirectory(SCAN_IMAGE_PATH);
            scanResult.images.map((image) => consola.info(image.virtualPath));
        });
}
