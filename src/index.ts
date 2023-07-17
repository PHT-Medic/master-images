/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { consola } from 'consola';
import cac from 'cac';
import { scanDirectory } from 'docker-scan';
import type { VersionTag } from './constants';
import { SCAN_IMAGE_PATH } from './constants';
import type { DockerModemStepInfo, DockerRegistry } from './core';
import {
    buildImage,
    buildImages,
    getRegistryConfig,
    getRegistryConfigWithFallback,
    pushImage,
    pushImages,
    tagImage,
    tagImages,
} from './core';
import {
    isDockerModemStreamRecord,
    parseDockerModemStepString,
} from './core/docker/utils/modem';
import { isNewLineCharacter, removeNewLineCharacter } from './utils';

const cli = cac('master-images');

cli.option('--tag <tag>', 'Specify a custom tag');

let stepInfo : DockerModemStepInfo | undefined;

const onCompleted = () => {
    if (stepInfo) {
        consola.success(`Step ${stepInfo.current}/${stepInfo.total} : Executed.`);
    }
};
const onProgress = (input: any) => {
    if (isNewLineCharacter(input.stream)) {
        return;
    }

    if (isDockerModemStreamRecord(input)) {
        const step = parseDockerModemStepString(input.stream);
        if (step) {
            if (stepInfo) {
                consola.success(`Step ${stepInfo.current}/${stepInfo.total} : Executed.`);
            }

            consola.info(removeNewLineCharacter(input.stream));
            consola.start(`Step ${step.current}/${step.total} : Executing...`);

            stepInfo = step;
        }
    }
};

cli
    .command('list', 'List all images')
    .action(async () => {
        const scanResult = await scanDirectory(SCAN_IMAGE_PATH);
        scanResult.images.map((image) => consola.info(image.virtualPath));
    });

cli
    .command('build [dir]', 'Build image(s)')
    .option('--registry <registry>', 'Provide a registry')
    .action(async (
        image: string | undefined,
        options: { registry?: string, tag?: `${VersionTag}` },
    ) => {
        let registry : DockerRegistry | undefined;
        if (options.registry) {
            registry = getRegistryConfigWithFallback(options.registry);
        }

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
                registry,
                image: scanResult.images[index],
                options: {
                    onCompleted,
                    onProgress,
                    tag: options.tag,
                },
            });
            return;
        }

        await buildImages({
            registry,
            images: scanResult.images,
            options: {
                onCompleted,
                onProgress,
                tag: options.tag,
            },
        });
    });

cli
    .command('push [dir]', 'Push image(s)')
    .option('--registry [registry]', 'Provide a registry')
    .action(async (
        image: string | undefined,
        options: { registry: string, tag?: `${VersionTag}` },
    ) => {
        let registry : DockerRegistry | undefined;
        if (options.registry) {
            registry = getRegistryConfig(options.registry);
        }

        if (!registry) {
            consola.warn(`Registry ${registry} could be found.`);
            process.exit(1);
        }

        const scanResult = await scanDirectory(SCAN_IMAGE_PATH);
        if (image) {
            const index = scanResult.images.findIndex(
                (el) => el.virtualPath === image,
            );
            if (index === -1) {
                consola.warn(`Image ${image} could not be found.`);
                process.exit(1);
            }

            await tagImage({
                image: scanResult.images[index],
                registry,
                options: {
                    tag: options.tag,
                },
            });
            await pushImage({
                image: scanResult.images[index],
                registry,
                options: {
                    tag: options.tag,
                },
            });
            return;
        }

        await tagImages({
            images: scanResult.images,
            registry,
            options: {
                tag: options.tag,
            },
        });
        await pushImages({
            images: scanResult.images,
            registry,
            options: {
                tag: options.tag,
            },
        });
    });

cli.help();
cli.parse();
