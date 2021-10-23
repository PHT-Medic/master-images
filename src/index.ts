import path from "path";
import Dockerode, {AuthConfig} from "dockerode";
import {config} from "dotenv";
import {scanDirectory, ScanResult} from "fs-docker";
import chalk from 'chalk'
import * as tarfs from 'tar-fs';

const ora = require('ora');

import {requireFromEnv} from "./utils";

config({
    path: path.resolve(__dirname, '../.env')
});

// Module init
const docker = new Dockerode();

// Constants

const registryHostSuffix : string = 'master';
const scanDirectoryPath : string = path.join(__dirname, '..', 'data');

const registryHostname : string = requireFromEnv('CONTAINER_REGISTRY');
const registryUsername : string = requireFromEnv('REGISTRY_USERNAME');
const registryPassword : string = requireFromEnv('REGISTRY_PASSWORD');

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

    const tags: string[] = [];
    const buildPromises: Promise<any>[] = [];

    try {
        spinner.start('Build');

        for(let i=0;i<scan.images.length; i++) {
            const tag : string = `${registryHostname}/${registryHostSuffix}/${scan.images[i].virtualPath}:latest`;
            tags.push(tag);

            const imageFilePath : string = path.join(scanDirectoryPath, scan.images[i].path);

            const pack = tarfs.pack(imageFilePath);

            const stream = await docker.buildImage(
                pack, {
                    t: tag,
                    authconfig: {
                        serveraddress: registryHostname,
                        username: registryUsername,
                        password: registryPassword
                    }
                });

            spinner.start(`Build: ${tag}`);

            buildPromises.push(new Promise((resolve, reject) => {
                return docker.modem.followProgress(
                    stream,
                    (err: Error, res: any[]) => {
                        if(err) reject(err);

                        const raw = res.pop();
                        if(typeof raw?.errorDetail?.message == 'string') {
                            reject(new Error(raw.errorDetail.message));
                        }

                        spinner.info(`Built: ${tag}`);

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
        spinner.start('Push images');

        const pushPromises: Promise<any>[] = [];
        for (let i = 0; i < tags.length; i++) {
            const image = docker.getImage(tags[i]);

            const stream = await image.push({
                authconfig: {
                    serveraddress: registryHostname,
                    username: registryUsername,
                    password: registryPassword
                } as AuthConfig
            });

            spinner.start(`Push: ${tags[i]}`);

            pushPromises.push(new Promise((resolve, reject) => {
                return docker.modem.followProgress(
                    stream,
                    (err: Error, res: any[]) => {
                        if(err) return reject(err);
                        const raw = res.pop();

                        if(Object.prototype.toString.call(raw) === '[object Object]') {
                            if(typeof raw?.errorDetail?.message == 'string') {
                                return reject(new Error(raw.errorDetail.message));
                            }
                        }

                        spinner.info(`Pushed: ${tags[i]}`);

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

        console.log(e);
        process.exit(1);
    }

    console.log(chalk.gray.underline('Finished'));
    process.exit(0);
})();
