/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getModuleExport, load, locateMany } from 'locter';
import { merge } from 'smob';
import type { OptionsInput } from '../type';

export async function loadOptions(path?: string) : Promise<OptionsInput> {
    const items : OptionsInput[] = [];

    const fileInfos = await locateMany('pht.config.{ts,cts,mts,cjs,mjs,js,json}', {
        path,
    });

    for (let i = 0; i < fileInfos.length; i++) {
        const data = await load(fileInfos[i]);
        const fileExport = getModuleExport(data);
        if (fileExport.key === 'default') {
            items.push(fileExport.value);
        }
    }

    return merge({}, ...items);
}
