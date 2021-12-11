/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {RegistryEnv} from "./constants";

export type RegistryConfig ={
    host: string,
    username: string,
    password: string
}

export type RegistryEnvType = `${RegistryEnv}`;
