/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image, ScanResult } from 'docker-scan';
import { useDockerDaemon } from '../daemon';
import type { DockerRegistry } from '../type';

export async function tagImage(scanImage: Image, registry: DockerRegistry) {
    const imageURL = `${registry.host}/${scanImage.virtualPath}`;

    const docker = useDockerDaemon();
    return new Promise<void>((resolve, reject) => {
        docker.getImage(`${scanImage.virtualPath}:latest`).tag({
            repo: imageURL,
        }, ((error) => {
            if (error) {
                error.path = imageURL;
                return reject(error);
            }

            return resolve();
        }));
    });
}

export async function tagImages(
    scanResult: ScanResult,
    registry: DockerRegistry,
) {
    const promises: Promise<any>[] = [];

    for (let i = 0; i < scanResult.images.length; i++) {
        promises.push(tagImage(scanResult.images[i], registry));
    }

    await Promise.all(promises);
}
