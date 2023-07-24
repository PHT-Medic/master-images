/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image } from 'docker-scan';
import { cleanDoubleSlashes, getPackageJsonVersionTag, withoutTrailingSlash } from '../../../utils';
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

type BuildImageURLContext = {
    image: Image,
    options?: ImageOptions,
    registry?: DockerRegistry,
    registryPath?: string
};
export async function buildImageURL(ctx: BuildImageURLContext) : Promise<string> {
    ctx.options = await extendImageOptions(ctx.options);

    let prefix = '';
    if (ctx.registry) {
        prefix = `${ctx.registry.host}/`;
    }

    if (ctx.registryPath) {
        prefix += `${ctx.registryPath}/`;
    }

    return cleanDoubleSlashes(`${withoutTrailingSlash(`${prefix}${ctx.image.virtualPath}`)}:${ctx.options.tag || 'latest'}`);
}
