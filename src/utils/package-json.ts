/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import path from 'node:path';
import semver from 'semver';
import { VersionTag } from '../constants';

export async function getPackageJsonVersionTag() : Promise<`${VersionTag}`> {
    const filePath = path.join(__dirname, '..', '..', 'package.json');

    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) {
        return VersionTag.LATEST;
    }

    const content = await fs.promises.readFile(filePath, { encoding: 'utf-8' });
    const json = JSON.parse(content);
    const version = json.version || '1.0.0';

    const parsed = semver.parse(version);
    if (!parsed) {
        return VersionTag.LATEST;
    }

    const tagName = parsed.prerelease[0];
    switch (tagName) {
        case 'alpha': {
            return VersionTag.ALPHA;
        }
        case 'beta': {
            return VersionTag.BETA;
        }
        case 'next': {
            return VersionTag.NEXT;
        }
    }

    return VersionTag.LATEST;
}
