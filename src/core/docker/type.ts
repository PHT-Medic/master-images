/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type DockerRegistry = {
    host: string,
    username?: string,
    password?: string
};

export type DockerModemStepInfo = {
    current: number,
    total: number
};
