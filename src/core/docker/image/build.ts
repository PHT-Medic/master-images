/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image } from 'docker-scan';
import path from 'node:path';
import tar from 'tar-fs';
import type { Config } from '../../../config';
import { SCAN_IMAGE_PATH } from '../../../constants';
import { useDockerDaemon } from '../daemon';
import { buildImageURL, isDockerModemResponseValid } from '../utils';
import type { ImageHooks } from './type';

export async function buildImage(context: {
    config: Config,
    image: Image,
    hooks?: ImageHooks
}) {
    const imageURL = await buildImageURL(context);

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

                if (context.hooks && context.hooks.onCompleted) {
                    context.hooks.onCompleted();
                }

                return resolve(res);
            },
            (res: any) => {
                if (context.hooks && context.hooks.onProgress) {
                    context.hooks.onProgress(res);
                }
            },
        );
    });
}
export async function buildImages(context: {
    images: Image[],
    config: Config,
    hooks?: ImageHooks
}) {
    const promises: Promise<any>[] = [];

    for (let i = 0; i < context.images.length; i++) {
        promises.push(buildImage({
            config: context.config,
            image: context.images[i],
            hooks: context.hooks,
        }));
    }

    await Promise.all(promises);
}
