/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image } from 'docker-scan';
import type { AuthConfig } from 'dockerode';
import { useDockerDaemon } from '../daemon';
import type { DockerRegistry } from '../type';
import { buildImageURL, isDockerModemResponseValid } from '../utils';
import type { ImageOptions } from './type';

export async function pushImage(context: {
    image: Image,
    registry: DockerRegistry,
    registryPath?: string,
    options?: ImageOptions
}) {
    const imageURL = await buildImageURL(context);

    const docker = useDockerDaemon();
    const image = docker.getImage(imageURL);

    let authConfig : AuthConfig | undefined;

    if (
        context.registry.username &&
        context.registry.password
    ) {
        authConfig = {
            serveraddress: context.registry.host,
            username: context.registry.username,
            password: context.registry.password,
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
    registry: DockerRegistry,
    registryPath?: string,
    options?: ImageOptions
}) {
    const promises: Promise<any>[] = [];

    for (let i = 0; i < context.images.length; i++) {
        promises.push(pushImage({
            image: context.images[i],
            registry: context.registry,
            registryPath: context.registryPath,
            options: context.options,
        }));
    }

    await Promise.all(promises);
}
