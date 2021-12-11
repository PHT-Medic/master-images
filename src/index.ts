/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from "path";
import DockerClient from "dockerode";
import {config} from "dotenv";
import {scanDirectory, ScanResult} from "fs-docker";
import chalk from 'chalk'
import * as tar from 'tar-fs';
import {requireFromEnv} from "./utils";
import {RegistryEnv} from "./constants";
import {RegistryConfig} from "./type";

const ora = require('ora');

config({
    path: path.resolve(__dirname, '../.env')
});

// Module init
const docker = new DockerClient();

// Constants

const registryHostSuffix : string = 'master';
const scanDirectoryPath : string = path.join(__dirname, '..', 'data');

const envAggregation : Record<RegistryEnv, string[]> = {
    [RegistryEnv.HOST]: requireFromEnv(RegistryEnv.HOST).split(','),
    [RegistryEnv.USERNAME]: requireFromEnv(RegistryEnv.USERNAME).split(','),
    [RegistryEnv.PASSWORD]: requireFromEnv(RegistryEnv.PASSWORD).split(',')
};

if(
    envAggregation[RegistryEnv.HOST].length !== envAggregation[RegistryEnv.PASSWORD].length ||
    envAggregation[RegistryEnv.PASSWORD].length !== envAggregation[RegistryEnv.USERNAME].length
) {
    console.log(chalk.bold('The amount of host, username & password data must be of the same size.'));
    process.exit(0);
}

const registryConfigurations : RegistryConfig[] = [];

const sum = envAggregation[RegistryEnv.HOST].length;
for(let i=0; i<sum; i++) {
    registryConfigurations.push({
        host: envAggregation[RegistryEnv.HOST][i],
        username: envAggregation[RegistryEnv.USERNAME][i],
        password: envAggregation[RegistryEnv.PASSWORD][i]
    })
}

(async () => {
    console.log(chalk.bold('Image scanning, building and publishing'));
    const spinner = ora({
        spinner: 'dots'
    });

    let scan : ScanResult;

    try {
        spinner.start('Scanning directory');

        scan = await scanDirectory(scanDirectoryPath);

        spinner.succeed('Scanned');
    } catch (e) {
        if(e instanceof Error) {
            spinner.fail('Could not scan directory');
        }

        console.log(e);
        process.exit(1);
    }

    const imageTags: { repository: string, tag: string }[] = [];
    const buildPromises: Promise<any>[] = [];

    try {
        spinner.start('Build');

        for(let i=0;i<scan.images.length; i++) {
            const tag : string = 'latest';
            const repository : string = `${registryHostSuffix}/${scan.images[i].virtualPath}`;

            imageTags.push({
                repository,
                tag
            });

            const fullTag = `${repository}:${tag}`;

            const imageFilePath : string = path.join(scanDirectoryPath, scan.images[i].path);

            const pack = tar.pack(imageFilePath);

            const stream = await docker.buildImage(
                pack, {
                    t: fullTag
                });

            spinner.start(`Build: ${fullTag}`);

            buildPromises.push(new Promise((resolve, reject) => {
                docker.modem.followProgress(
                    stream,
                    (err: Error, res: any[]) => {
                        if(err) return reject(err);

                        const raw = res.pop();
                        if(typeof raw?.errorDetail?.message == 'string') {
                            return reject(new Error(raw.errorDetail.message));
                        }

                        spinner.info(`Built: ${fullTag}`);

                        resolve(res);
                    }
                );
            }));
        }

        await Promise.all(buildPromises);

        spinner.succeed('Built');
    } catch (e) {
        if(e instanceof Error) {
            spinner.fail('Build failed');
        }

        console.log(e);
        process.exit(1);
    }

    const pushConfigurations : { path: string, registryConfig: RegistryConfig }[] = [];

    try {
        spinner.start('Tagging');

        const tagPromises: Promise<any>[] = [];

        for(let i=0;i<imageTags.length; i++) {
            const image = await docker.getImage(imageTags[i].repository+':'+imageTags[i].tag);

            for(let j=0; j<registryConfigurations.length; j++) {
                const tagPromise = new Promise<void>(((resolve, reject) => {
                    spinner.start(`Tag: ${imageTags[i].repository}`);
                    const destinationRepository = `${registryConfigurations[j].host}/${imageTags[i].repository}`;

                    pushConfigurations.push({
                        path: `${destinationRepository}:${imageTags[i].tag}`,
                        registryConfig: registryConfigurations[j]
                    });

                    image.tag({
                        repo: destinationRepository,
                        tag: imageTags[i].tag
                    },((error, result) => {
                        if(error) {
                            return reject(error);
                        }

                        spinner.info(`Tagged: ${destinationRepository}`);

                        resolve();
                    }));
                }));

                tagPromises.push(tagPromise);
            }
        }

        await Promise.all(tagPromises);

        spinner.succeed('Tagged');
    } catch (e) {
        if(e instanceof Error) {
            spinner.fail('Tagging failed');
        }

        console.log(e);
        process.exit(1);
    }

    try {
        spinner.start('Push images');

        const pushPromises: Promise<any>[] = [];
        for (let i = 0; i < pushConfigurations.length; i++) {
            const image = docker.getImage(pushConfigurations[i].path);

            const stream = await image.push({
                authconfig: {
                    serveraddress: pushConfigurations[i].registryConfig.host,
                    username: pushConfigurations[i].registryConfig.username,
                    password: pushConfigurations[i].registryConfig.password
                }
            });

            spinner.start(`Push: ${pushConfigurations[i].path}`);

            pushPromises.push(new Promise((resolve, reject) => {
                docker.modem.followProgress(
                    stream,
                    (err: Error, res: any[]) => {
                        if(err) {
                            return reject(err);
                        }

                        const raw = res.pop();

                        if(Object.prototype.toString.call(raw) === '[object Object]') {
                            if(typeof raw?.errorDetail?.message == 'string') {
                                return reject(new Error(raw.errorDetail.message));
                            }
                        }

                        spinner.info(`Pushed: ${pushConfigurations[i].path}`);

                        return resolve(res);
                    }
                );
            }));
        }

        await Promise.all(pushPromises);

        spinner.succeed('Pushed');
    } catch (e) {
        if(e instanceof Error) {
            spinner.fail('Push failed');
        }

        console.log('failed', e);
        process.exit(1);
    }

    console.log(chalk.gray.underline('Finished'));
    process.exit(0);
})();
