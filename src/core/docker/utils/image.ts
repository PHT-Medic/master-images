/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image } from 'docker-scan';
import type { Config } from '../../../config';
import { cleanDoubleSlashes, withoutTrailingSlash } from '../../../utils';

type BuildImageURLContext = {
    image: Image,
    config: Config
};
export async function buildImageURL(ctx: BuildImageURLContext) : Promise<string> {
    let prefix = '';
    const host = ctx.config.get('registryHost');
    if (host) {
        prefix = `${host}/`;
    }

    const registryPath = ctx.config.get('registryPath');
    if (registryPath) {
        prefix += `${registryPath}/`;
    }

    return cleanDoubleSlashes(`${withoutTrailingSlash(`${prefix}${ctx.image.virtualPath}`)}:${ctx.config.get('tag') || 'latest'}`);
}
