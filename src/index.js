"use strict";
/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dockerode_1 = __importDefault(require("dockerode"));
const dotenv_1 = require("dotenv");
const fs_docker_1 = require("fs-docker");
const chalk_1 = __importDefault(require("chalk"));
const tar = __importStar(require("tar-fs"));
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const ora = require('ora');
(0, dotenv_1.config)({
    path: path_1.default.resolve(__dirname, '../.env')
});
// Module init
const docker = new dockerode_1.default();
// Constants
const registryHostSuffix = 'master';
const scanDirectoryPath = path_1.default.join(__dirname, '..', 'data');
const envAggregation = {
    [constants_1.RegistryEnv.HOST]: (0, utils_1.requireFromEnv)(constants_1.RegistryEnv.HOST).split(','),
    [constants_1.RegistryEnv.USERNAME]: (0, utils_1.requireFromEnv)(constants_1.RegistryEnv.USERNAME).split(','),
    [constants_1.RegistryEnv.PASSWORD]: (0, utils_1.requireFromEnv)(constants_1.RegistryEnv.PASSWORD).split(',')
};
if (envAggregation[constants_1.RegistryEnv.HOST].length !== envAggregation[constants_1.RegistryEnv.PASSWORD].length ||
    envAggregation[constants_1.RegistryEnv.PASSWORD].length !== envAggregation[constants_1.RegistryEnv.USERNAME].length) {
    console.log(chalk_1.default.bold('The amount of host, username & password data must be of the same size.'));
    process.exit(0);
}
const registryConfigurations = [];
const sum = envAggregation[constants_1.RegistryEnv.HOST].length;
for (let i = 0; i < sum; i++) {
    registryConfigurations.push({
        host: envAggregation[constants_1.RegistryEnv.HOST][i],
        username: envAggregation[constants_1.RegistryEnv.USERNAME][i],
        password: envAggregation[constants_1.RegistryEnv.PASSWORD][i]
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log(chalk_1.default.bold('Image scanning, building and publishing'));
    const spinner = ora({
        spinner: 'dots'
    });
    let scan;
    try {
        spinner.start('Scanning directory');
        scan = yield (0, fs_docker_1.scanDirectory)(scanDirectoryPath);
        spinner.succeed('Scanned');
    }
    catch (e) {
        if (e instanceof Error) {
            spinner.fail('Could not scan directory');
        }
        console.log(e);
        process.exit(1);
    }
    const baseTags = [];
    const buildPromises = [];
    try {
        spinner.start('Build');
        for (let i = 0; i < scan.images.length; i++) {
            const tag = `${registryHostSuffix}/${scan.images[i].virtualPath}:latest`;
            baseTags.push(tag);
            const imageFilePath = path_1.default.join(scanDirectoryPath, scan.images[i].path);
            const pack = tar.pack(imageFilePath);
            const stream = yield docker.buildImage(pack, {
                t: tag
            });
            spinner.start(`Build: ${tag}`);
            buildPromises.push(new Promise((resolve, reject) => {
                return docker.modem.followProgress(stream, (err, res) => {
                    var _a;
                    if (err)
                        reject(err);
                    const raw = res.pop();
                    if (typeof ((_a = raw === null || raw === void 0 ? void 0 : raw.errorDetail) === null || _a === void 0 ? void 0 : _a.message) == 'string') {
                        reject(new Error(raw.errorDetail.message));
                    }
                    spinner.info(`Built: ${tag}`);
                    resolve(res);
                });
            }));
        }
        yield Promise.all(buildPromises);
        spinner.succeed('Built');
    }
    catch (e) {
        if (e instanceof Error) {
            spinner.fail('Build failed');
        }
        console.log(e);
        process.exit(1);
    }
    const pushConfigurations = [];
    try {
        spinner.start('Tag images');
        const tagPromises = [];
        for (let i = 0; i < baseTags.length; i++) {
            const image = yield docker.getImage(baseTags[i]);
            for (let j = 0; j < registryConfigurations.length; j++) {
                const tagPromise = new Promise(((resolve, reject) => {
                    spinner.start(`Build tag: ${baseTags[i]}`);
                    const destinationTag = `${registryConfigurations[j].host}/${baseTags[i]}`;
                    pushConfigurations.push({
                        tag: destinationTag,
                        registryConfig: registryConfigurations[j]
                    });
                    image.tag({
                        tag: destinationTag
                    }, ((error, result) => {
                        if (error) {
                            return reject();
                        }
                        spinner.info(`Built tag: ${destinationTag}`);
                        resolve();
                    }));
                }));
                tagPromises.push(tagPromise);
            }
        }
        yield Promise.all(tagPromises);
        spinner.succeed('Tagged images');
    }
    catch (e) {
        if (e instanceof Error) {
            spinner.fail('Tag images failed');
        }
        console.log(e);
        process.exit(1);
    }
    try {
        spinner.start('Push images');
        const pushPromises = [];
        for (let i = 0; i < pushConfigurations.length; i++) {
            const image = docker.getImage(pushConfigurations[i].tag);
            const stream = yield image.push({
                authconfig: {
                    serveraddress: pushConfigurations[i].registryConfig.host,
                    username: pushConfigurations[i].registryConfig.username,
                    password: pushConfigurations[i].registryConfig.password
                }
            });
            spinner.start(`Push: ${pushConfigurations[i].tag}`);
            pushPromises.push(new Promise((resolve, reject) => {
                docker.modem.followProgress(stream, (err, res) => {
                    var _a;
                    if (err)
                        return reject(err);
                    const raw = res.pop();
                    if (Object.prototype.toString.call(raw) === '[object Object]') {
                        if (typeof ((_a = raw === null || raw === void 0 ? void 0 : raw.errorDetail) === null || _a === void 0 ? void 0 : _a.message) == 'string') {
                            return reject(new Error(raw.errorDetail.message));
                        }
                    }
                    spinner.info(`Pushed: ${pushConfigurations[i].tag}`);
                    resolve(res);
                });
            }));
        }
        yield Promise.all(pushPromises);
        spinner.succeed('Pushed');
    }
    catch (e) {
        if (e instanceof Error) {
            spinner.fail('Push failed');
        }
        console.log(e);
        process.exit(1);
    }
    console.log(chalk_1.default.gray.underline('Finished'));
    process.exit(0);
}))();
//# sourceMappingURL=index.js.map