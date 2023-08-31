/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { consola } from 'consola';
import type { DockerModemStepInfo } from '../../core';
import { isDockerModemStreamRecord, parseDockerModemStepString } from '../../core/docker/utils/modem';
import { isNewLineCharacter, removeNewLineCharacter } from '../../utils';

let stepInfo : DockerModemStepInfo | undefined;

export function onCompletedHook() {
    if (stepInfo) {
        consola.success(`Step ${stepInfo.current}/${stepInfo.total} : Executed.`);
        stepInfo = undefined;
    }
}
export function onProgressHook(input: any) {
    if (isDockerModemStreamRecord(input)) {
        if (isNewLineCharacter(input.stream)) {
            return;
        }

        const step = parseDockerModemStepString(input.stream);
        if (step) {
            if (stepInfo) {
                consola.success(`Step ${stepInfo.current}/${stepInfo.total} : Executed.`);
            }

            consola.info(removeNewLineCharacter(input.stream));
            consola.start(`Step ${step.current}/${step.total} : Executing...`);

            stepInfo = step;
        }
    }
}
