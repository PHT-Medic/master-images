/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CAC } from 'cac';
import { consola } from 'consola';
import { scanDirectory } from 'docker-scan';
import { createConfig } from '../config';
import { SCAN_IMAGE_PATH } from '../constants';
import { buildImage, buildImages } from '../core';
import type { CLICommandOptions } from './type';
import { onCompletedHook, onProgressHook } from './utils/hooks';
import { applyCLICommandOptions, setCLICommandOptions } from './utils/options';

export function registerCLIBuildCommand(cli: CAC) {
    const command = cli
        .command('build [dir]', 'Build image(s)');

    setCLICommandOptions(command);

    command
        .action(async (
            image: string | undefined,
            options: CLICommandOptions,
        ) => {
            const config = await createConfig();

            applyCLICommandOptions(config, options);

            const scanResult = await scanDirectory(SCAN_IMAGE_PATH);
            if (image) {
                const index = scanResult.images.findIndex(
                    (el) => el.virtualPath === image,
                );
                if (index === -1) {
                    consola.warn(`Image ${image} could not be found.`);
                    process.exit(1);
                }

                await buildImage({
                    config,
                    image: scanResult.images[index],
                    hooks: {
                        onCompleted: onCompletedHook,
                        onProgress: onProgressHook,
                    },
                });
                return;
            }

            await buildImages({
                config,
                images: scanResult.images,
                hooks: {
                    onCompleted: onCompletedHook,
                    onProgress: onProgressHook,
                },
            });
        });
}
