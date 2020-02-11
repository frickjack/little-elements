import SecretsManager = require("aws-sdk/clients/secretsmanager.js");
import fs = require("fs");
import os = require("os");
import {LazyProvider} from "../common/provider.js";

const homedir = os.homedir();

/**
 * Module for managing loading of configuration
 * from various sources, and reloading that
 * configuration periodically - to account for
 * secret rotation, etc.
 */

 /**
  * Load configuration from a file
  *
  * @param fileName
  * @param ttlSecs
  */
export function loadFromFile(fileName: string, ttlSecs: number): LazyProvider<any> {
    return new LazyProvider(
        () => loadJsonFromFile(fileName), ttlSecs,
    );
}

/**
 * Load configuration from a secret
 *
 * @param secretId ARN or name of secret
 * @param ttlSecs rotation period in seconds
 */
export function loadFromSecret(secretId: string, ttlSecs: number): LazyProvider<any> {
    return new LazyProvider(
        () => loadJsonFromSecret(secretId), ttlSecs,
    );
}

export interface LoadRule {
    type: string;
    ttlSecs: number;
    path: string;
}

const defaultRule: LoadRule = {
    path: (homedir + "/.local/etc/littleware/authn/config.json"),
    ttlSecs: 300,
    type: "file",
};

/**
 * Load configuration from the source specified by the given rule.
 *
 * @param ruleIn specifies type of source (currently supports secret
 * or file), ttlSecs, and path - merges with default rule
 */
export function loadFromRule(ruleIn?: LoadRule | { path: string } | string): LazyProvider<any> {
    let ruleObj = null;
    if (typeof ruleIn === "string") {
        ruleObj = JSON.parse(ruleIn as string);
    } else {
        ruleObj = ruleIn;
    }
    const rule = { ... defaultRule, ... ruleObj || {} };
    if (rule.type === "file") {
        return loadFromFile(rule.path, rule.ttlSecs);
    } else if (rule.type === "secret") {
        return loadFromSecret(rule.path, rule.ttlSecs);
    }
    throw new Error("Unknown type: " + rule.type);
}

/**
 * Load the json at the given file
 *
 * @param fileName
 */
export function loadJsonFromFile(fileName: string): Promise<any> {
    return new Promise(
        (resolve, reject) => {
            fs.readFile(fileName, "utf8",
                (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const config = JSON.parse(data);
                    resolve(config);
                },
            );
        },
    );
}

export function loadJsonFromSecret(secretId: string): Promise<any> {
    const secretsmanager = new SecretsManager();
    return new Promise((resolve, reject) => {
        secretsmanager.getSecretValue({ SecretId: secretId }, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
                return;
            },
        );
    });
}
