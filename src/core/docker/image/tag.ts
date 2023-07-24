/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image } from 'docker-scan';
import { useDockerDaemon } from '../daemon';
import type { DockerRegistry } from '../type';
import { buildImageURL, extendImageOptions } from '../utils';
import type { ImageOptions } from './type';

export async function tagImage(context: {
    image: Image,
    registryIn: DockerRegistry,
    registryPathIn?: string,
    registryOut: DockerRegistry,
    registryPathOut?: string,
    options?: ImageOptions
}) {
    const tagIn = await buildImageURL({
        image: context.image,
        options: context.options,
        registry: context.registryIn,
        registryPath: context.registryPathIn,
    });

    const tagOut = await buildImageURL({
        image: context.image,
        options: context.options,
        registry: context.registryOut,
        registryPath: context.registryPathOut,
    });

    const docker = useDockerDaemon();
    return new Promise<void>((resolve, reject) => {
        docker.getImage(tagIn).tag({
            repo: tagOut,
        }, ((error) => {
            if (error) {
                return reject(error);
            }

            return resolve();
        }));
    });
}

export async function tagImages(context: {
    images: Image[],
    registryIn: DockerRegistry,
    registryPathIn?: string,
    registryOut: DockerRegistry,
    registryPathOut?: string,
    options?: ImageOptions
}) {
    const promises: Promise<any>[] = [];

    context.options = await extendImageOptions(context.options);

    for (let i = 0; i < context.images.length; i++) {
        promises.push(tagImage({
            image: context.images[i],
            registryIn: context.registryIn,
            registryPathIn: context.registryPathIn,
            registryOut: context.registryOut,
            registryPathOut: context.registryPathOut,
            options: context.options,
        }));
    }

    await Promise.all(promises);
}
