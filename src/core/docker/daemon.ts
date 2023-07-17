/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import DockerClient from 'dockerode';

let instance : DockerClient | undefined;
export function useDockerDaemon() {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    instance = new DockerClient();

    return instance;
}
