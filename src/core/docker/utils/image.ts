/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image } from 'docker-scan';
import { getPackageJsonVersionTag, withoutTrailingSlash } from '../../../utils';
import type { ImageOptions } from '../image/type';
import type { DockerRegistry } from '../type';

export async function extendImageOptions(options?: ImageOptions) : Promise<ImageOptions> {
    if (!options) {
        options = {};
    }

    if (!options.tag) {
        options.tag = await getPackageJsonVersionTag();
    }

    return options;
}

export async function buildImageURL(
    image: Image,
    options?: ImageOptions,
    registry?: DockerRegistry,
) : Promise<string> {
    options = await extendImageOptions(options);
    return `${registry ?
        `${withoutTrailingSlash(registry.host)}/${image.virtualPath}` :
        image.virtualPath}:${options.tag || 'latest'}`;
}
