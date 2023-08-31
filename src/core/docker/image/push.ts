/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image } from 'docker-scan';
import type { AuthConfig } from 'dockerode';
import type { Config } from '../../../config';
import { useDockerDaemon } from '../daemon';
import { buildImageURL, isDockerModemResponseValid } from '../utils';
import type { ImageHooks } from './type';

export async function pushImage(context: {
    image: Image,
    config: Config,
    hooks?: ImageHooks
}) {
    const imageURL = await buildImageURL(context);

    const docker = useDockerDaemon();
    const image = docker.getImage(imageURL);

    let authConfig : AuthConfig | undefined;

    if (
        context.config.has('registryUser') &&
        context.config.has('registryPassword')
    ) {
        authConfig = {
            serveraddress: context.config.get('registryHost') as string,
            username: context.config.get('registryUser') as string,
            password: context.config.get('registryPassword') as string,
        };
    }

    const stream = await image.push({
        authconfig: authConfig,
    });

    return new Promise((resolve, reject) => {
        docker.modem.followProgress(
            stream,
            (err: Error | null, res: any[]) => {
                if (err) return reject(err);

                if (!isDockerModemResponseValid(res)) {
                    reject(new Error('Image could not be build.'));
                }

                return resolve(res);
            },
        );
    });
}
export async function pushImages(context: {
    images: Image[],
    config: Config,
    hooks?: ImageHooks
}) {
    const promises: Promise<any>[] = [];

    for (let i = 0; i < context.images.length; i++) {
        promises.push(pushImage({
            image: context.images[i],
            config: context.config,
            hooks: context.hooks,
        }));
    }

    await Promise.all(promises);
}
