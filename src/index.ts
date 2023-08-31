#!/usr/bin/env node
/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import cac from 'cac';
import { registerCLIBuildCommand } from './commands/build';
import { registerCLIListCommand } from './commands/list';
import { registerCLIPushCommand } from './commands/push';
import { registerCLIWebhookCommand } from './commands/webhook';

const cli = cac('master-images');

registerCLIListCommand(cli);
registerCLIBuildCommand(cli);
registerCLIPushCommand(cli);
registerCLIWebhookCommand(cli);

cli.help();
cli.parse();
