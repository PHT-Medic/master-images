/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image, ScanResult } from 'docker-scan';
import type { AuthConfig } from 'dockerode';
import { useDockerDaemon } from '../daemon';
import type { DockerRegistry } from '../type';
import { isDockerModemResponseValid } from '../utils';

export async function pushImage(scanImage: Image, registry: DockerRegistry) {
    const imageURL = `${registry.host}/${scanImage.virtualPath}:latest`;

    const docker = useDockerDaemon();
    const image = docker.getImage(imageURL);

    let authConfig : AuthConfig | undefined;

    if (registry.username && registry.password) {
        authConfig = {
            serveraddress: registry.host,
            username: registry.username,
            password: registry.password,
        };
    }

    const stream = await image.push({
        authconfig: authConfig,
    });

    return new Promise((resolve, reject) => {
        docker.modem.followProgress(
            stream,
            (err: Error | null, res: any[]) => {
                if (err) return reject(err);

                if (!isDockerModemResponseValid(res)) {
                    reject(new Error('Image could not be build.'));
                }

                return resolve(res);
            },
        );
    });
}
export async function pushImages(
    scanResult: ScanResult,
    registry: DockerRegistry,
) {
    const promises: Promise<any>[] = [];

    for (let i = 0; i < scanResult.images.length; i++) {
        promises.push(pushImage(scanResult.images[i], registry));
    }

    await Promise.all(promises);
}
