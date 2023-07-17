/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image } from 'docker-scan';
import { withoutTrailingSlash } from '../../../utils';
import { useDockerDaemon } from '../daemon';
import type { DockerRegistry } from '../type';
import { buildImageURL, extendImageOptions } from '../utils';
import type { ImageOptions } from './type';

export async function tagImage(context: {
    image: Image,
    registry: DockerRegistry,
    options?: ImageOptions
}) {
    const imageURL = await buildImageURL(context.image, context.options);

    const docker = useDockerDaemon();
    return new Promise<void>((resolve, reject) => {
        docker.getImage(`${imageURL}`).tag({
            repo: `${withoutTrailingSlash(context.registry.host)}/${imageURL}`,
        }, ((error) => {
            if (error) {
                error.path = imageURL;
                return reject(error);
            }

            return resolve();
        }));
    });
}

export async function tagImages(context: {
    images: Image[],
    registry: DockerRegistry,
    options?: ImageOptions
}) {
    const promises: Promise<any>[] = [];

    context.options = await extendImageOptions(context.options);

    for (let i = 0; i < context.images.length; i++) {
        promises.push(tagImage({
            image: context.images[i],
            registry: context.registry,
            options: context.options,
        }));
    }

    await Promise.all(promises);
}
