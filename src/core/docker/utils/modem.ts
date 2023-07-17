/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '../../../utils';
import type { DockerModemStepInfo } from '../type';

export function isDockerModemStreamRecord(input: unknown): input is { stream: string } {
    return isObject(input) &&
        typeof input.stream === 'string';
}

export function isDockerModemStepString(input: string) {
    return input.startsWith('Step');
}

export function parseDockerModemStepString(input: string) : DockerModemStepInfo | undefined {
    const matches = input.match(/^Step\s([0-9])\/([0-9])\s:.*/s);
    if (!matches) {
        return undefined;
    }

    return {
        current: parseInt(matches[1], 10),
        total: parseInt(matches[2], 10),
    };
}
