/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from "path";
import DockerClient, {AuthConfig} from "dockerode";
import {config} from "dotenv";
import {scanDirectory, ScanResult} from "fs-docker";
import chalk from 'chalk'
import * as tar from 'tar-fs';
import {requireFromEnv} from "./utils";
import {RegistryEnv} from "./constants";
import {RegistryConfig} from "./type";
import {syncScanResultToCentralAPI} from "./utils";

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

const registries : RegistryConfig[] = [];

const sum = envAggregation[RegistryEnv.HOST].length;
for(let i=0; i<sum; i++) {
    registries.push({
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

    const images: string[] = [];

    try {
        spinner.start('Build');

        const buildPromises: Promise<any>[] = [];
        for(let i=0;i<scan.images.length; i++) {
            const image : string = `${registryHostSuffix}/${scan.images[i].virtualPath}`;

            images.push(image);

            const imageFilePath : string = path.join(scanDirectoryPath, scan.images[i].path);

            const pack = tar.pack(imageFilePath);

            const stream = await docker.buildImage(
                pack, {
                    t: image
                });

            spinner.start(`Build: ${image}`);

            buildPromises.push(new Promise((resolve, reject) => {
                docker.modem.followProgress(
                    stream,
                    (err: Error, res: any[]) => {
                        if(err) return reject(err);

                        const raw = res.pop();
                        if(typeof raw?.errorDetail?.message == 'string') {
                            return reject(new Error(raw.errorDetail.message));
                        }

                        spinner.info(`Built: ${image}`);

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

    try {
        spinner.start('Tagging');

        const tagPromises: Promise<any>[] = [];

        for(let i=0; i<images.length; i++) {
            for(let j=0; j<registries.length; j++) {
                const repository = `${registries[j].host}/${images[i]}`;

                const tagPromise = new Promise<void>(((resolve, reject) => {
                    spinner.start(`Tagging: ${repository}`);

                    docker.getImage(`${images[i]}:latest`).tag({
                        repo: repository
                    }, ((error, result) => {
                        if (error) {
                            error.path = repository;
                            return reject(error);
                        }

                        spinner.info(`Tagged: ${repository}`);

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
        for (let i = 0; i < registries.length; i++) {
            const authConfig : AuthConfig = {
                serveraddress: registries[i].host,
                    username: registries[i].username,
                    password: registries[i].password
            }

            for(let j=0; j<images.length; j++) {
                const repository = `${registries[i].host}/${images[j]}:latest`;
                const image = docker.getImage(repository);

                const stream = await image.push({
                    authconfig: authConfig
                });

                spinner.start(`Push: ${repository}`);

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

                            spinner.info(`Pushed: ${repository}`);

                            return resolve(res);
                        }
                    );
                }));
            }
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

    try {
        await syncScanResultToCentralAPI(scan);
        spinner.succeed('Synced with Central-API');
    } catch (e) {
        if(e instanceof Error) {
            spinner.fail('Push to Central-API failed...');
        }

        console.log('failed', e);
    }

    console.log(chalk.gray.underline('Finished'));
    process.exit(0);
})();
