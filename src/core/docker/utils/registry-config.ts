/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RegistryEnv } from '../../../constants';
import { requireFromEnv } from '../../../utils';
import type { DockerRegistry } from '../type';

function transformHost(host: string) {
    if (
        host.startsWith('http://') ||
        host.startsWith('https://')
    ) {
        const parsed = new URL(host);
        return parsed.hostname;
    }

    return host;
}

export function getRegistryConfig(registryURL: string): DockerRegistry | undefined {
    const hosts : string[] = requireFromEnv(RegistryEnv.HOST, '').split(',')
        .map((host) => transformHost(host));
    const usernames : string[] = requireFromEnv(RegistryEnv.USERNAME, '').split(',');
    const passwords : string[] = requireFromEnv(RegistryEnv.PASSWORD, '').split(',');

    if (
        hosts.length !== passwords.length ||
        passwords.length !== hosts.length
    ) {
        throw new Error('The amount of host, username & password data must be of the same size.');
    }

    const index = hosts.findIndex((host) => host === registryURL);
    if (index === -1) {
        return undefined;
    }

    const username = usernames[index];
    const password = passwords[index];

    return {
        host: hosts[index],
        ...(username ? { username } : {}),
        ...(password ? { password } : {}),
    };
}

export function getRegistryConfigWithFallback(registryURL: string): DockerRegistry {
    const registry = getRegistryConfig(registryURL);
    if (!registry) {
        return {
            host: transformHost(registryURL),
        };
    }

    return registry;
}
