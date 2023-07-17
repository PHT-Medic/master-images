/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image, ScanResult } from 'docker-scan';
import path from 'node:path';
import tar from 'tar-fs';
import { SCAN_IMAGE_PATH } from '../../../constants';
import { useDockerDaemon } from '../daemon';
import type { DockerRegistry } from '../type';
import { isDockerModemResponseValid } from '../utils';
import type { ImageOptions } from './type';

export async function buildImage(context: {
    image: Image,
    registry?: DockerRegistry,
    options?: ImageOptions
}) {
    const imageURL = context.registry ?
        `${context.registry.host}/${context.image.virtualPath}` :
        context.image.virtualPath;

    const imageFilePath : string = path.join(SCAN_IMAGE_PATH, context.image.path);

    const pack = tar.pack(imageFilePath);

    const docker = useDockerDaemon();
    const stream = await docker.buildImage(pack, {
        t: imageURL,
    });

    return new Promise((resolve, reject) => {
        docker.modem.followProgress(
            stream,
            (err: Error | null, res: any[]) => {
                if (err) return reject(err);

                if (!isDockerModemResponseValid(res)) {
                    reject(new Error('Image could not be build.'));
                }

                if (context.options && context.options.onCompleted) {
                    context.options.onCompleted();
                }

                return resolve(res);
            },
            (res: any) => {
                if (context.options && context.options.onProgress) {
                    context.options.onProgress(res);
                }
            },
        );
    });
}
export async function buildImages(context: {
    scanResult: ScanResult,
    registry?: DockerRegistry,
    options?: ImageOptions
}) {
    const promises: Promise<any>[] = [];

    for (let i = 0; i < context.scanResult.images.length; i++) {
        promises.push(buildImage({
            image: context.scanResult.images[i],
            registry: context.registry,
            options: context.options,
        }));
    }

    await Promise.all(promises);
}
