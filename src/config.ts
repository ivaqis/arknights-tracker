import dotenv from "dotenv";
import path from "node:path";
import winston from "winston";

loadEnv();

const skportBaseDomain = process.env.SKPORT_BASE_DOMAIN || null;

export const config = {
    envName: process.env.NODE_ENV || null,
    port: Number(process.env.PORT) || 3001,
    databaseUrl: process.env.DATABASE_URL || null,
    adminSecret: process.env.ADMIN_SECRET || "super_secret_fallback_key_123",
    loggingLevel: getLoggingLevel(),
    gryphlineAuthUrl: process.env.GRYPHLINE_AUTH_URL || null,
    skportBindingPath: process.env.SKPORT_BIND_PATH || null,
    skportDetailPath: process.env.SKPORT_DETAIL_PATH || null,
    skportContractPath: process.env.SKPORT_CC_PATH || null,
    skportContractRecordsPath: process.env.SKPORT_CC_REC_PATH || null,
    skportMonumentPath: process.env.SKPORT_MONUMENT_PATH || null,
    skportCredUrl: getSkportCredUrl(),
    skportBindingUrl: getSkportBindingUrl(),
    skportDetailUrl: getSkportDetailUrl(),
    skportContractUrl: getSkportContractUrl(),
    skportContractRecordsUrl: getSkportContractRecordsUrl(),
    skportMonumentUrl: getSkportMonumentUrl(),
    sightengineUser: process.env.SIGHTENGINE_USER || null,
    sightengineSecret: process.env.SIGHTENGINE_SECRET || null,
} as const;

function loadEnv(): void {
    const envName = process.env.NODE_ENV;

    dotenv.config();

    if (envName) {
        dotenv.config({
            path: path.resolve(process.cwd(), `.env.${envName}`),
        });
    }
}

function getSkportCredUrl() {
    return skportBaseDomain && process.env.SKPORT_CRED_PATH
        ? `${skportBaseDomain}${process.env.SKPORT_CRED_PATH}`
        : null;
}

function getSkportBindingUrl() {
    return skportBaseDomain && process.env.SKPORT_BIND_PATH
        ? `${skportBaseDomain}${process.env.SKPORT_BIND_PATH}`
        : null;
}

function getSkportDetailUrl() {
    return skportBaseDomain && process.env.SKPORT_DETAIL_PATH
        ? `${skportBaseDomain}${process.env.SKPORT_DETAIL_PATH}`
        : null;
}

function getSkportContractUrl() {
    return skportBaseDomain && process.env.SKPORT_CC_PATH
        ? `${skportBaseDomain}${process.env.SKPORT_CC_PATH}`
        : null;
}

function getSkportContractRecordsUrl() {
    return skportBaseDomain && process.env.SKPORT_CC_REC_PATH
        ? `${skportBaseDomain}${process.env.SKPORT_CC_REC_PATH}`
        : null;
}

function getSkportMonumentUrl() {
    return skportBaseDomain && process.env.SKPORT_MONUMENT_PATH
        ? `${skportBaseDomain}${process.env.SKPORT_MONUMENT_PATH}`
        : null;
}

function getLoggingLevel() {
    const levels = new Set(Object.keys(winston.config.npm.levels));
    const current = process.env.LOGGING_LEVEL;

    if (!current) {
        console.log("No logging level provided. Selected \"info\" by default.");

        return "info";
    }

    if (!levels.has(current)) {
        console.log(`Invalid logging level: "${current}". Selected \"info\" by default.`);
    }

    return current;
}