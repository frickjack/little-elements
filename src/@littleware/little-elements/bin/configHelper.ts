import SecretsManager = require("aws-sdk/clients/secretsmanager.js");
import { createLogger } from "bunyan";
import fs = require("fs");
import os = require("os");
import {LazyProvider} from "../common/provider.js";

const log = createLogger({ name: "little-server" });
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
    ttlSecs: number;
    type: string;
    value: string;
}

const defaultRule: LoadRule = {
    ttlSecs: 300,
    type: "file",
    value: (homedir + "/.local/etc/littleware/authn/config.json"),
};

/**
 * Load configuration from the sources specified by the given rule,
 * and combine the results into a single object via
 * Object.assign(this, listOfConfigs)
 *
 * @param rulesIn pulled from process.env["LITTLE_CONFIG"] if not set,
 *   mapping from key to LoadRule that
 *   specifies type of source (currently supports secret, env, string,
 *   or file), ttlSecs, and path - merges with default rule (homedir + "/.local/share/littleware/authn/config.json")
 * @return Provider that provides mapping from key to loaded data
 */
export function loadFromRule(
    rulesIn?: { [key: string]: LoadRule | { value: string }} | string,
): LazyProvider<{[key: string]: any}> {
    let ruleMap: {[key: string]: LoadRule } = {};
    rulesIn = rulesIn || process.env.LITTLE_CONFIG || { default: defaultRule };

    if (typeof rulesIn === "string") {
        ruleMap = JSON.parse(rulesIn as string);
    } else {
        ruleMap = rulesIn as {[key: string]: LoadRule};
    }
    const promiseList = Object.entries(ruleMap).map(
        (r) => ({ key: r[0], rule: { ...defaultRule, ...r[1] } as LoadRule }),
    ).map(
        async ({key, rule}) => {
            let data;
            if (rule.type === "file") {
                data = await loadJsonFromFile(rule.value);
            } else if (rule.type === "secret") {
                data = await loadJsonFromSecret(rule.value);
            } else if (rule.type === "string") {
                data = JSON.parse(rule.value);
            } else if (rule.type === "env") {
                data = JSON.parse(process.env[rule.value] || "{}");
            } else {
                data = { error: `unknown rule type: ${rule.type}` };
            }
            return {key, data};
        },
    );
    const dataPromise = Promise.all(promiseList).then(
        (kvList) => kvList.reduce(
            (acc, {key, data}) => {
                acc[key] = data;
                return acc;
            }, {},
        ),
    );
    return new LazyProvider(() => dataPromise);
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
