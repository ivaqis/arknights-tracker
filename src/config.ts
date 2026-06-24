import dotenv from "dotenv";
import path from "node:path";

loadEnv();

export const config = {
    envName: process.env.NODE_ENV || null,
    port: process.env.PORT || "3001",
    databaseUrl: process.env.DATABASE_URL || null,
    adminSecret: process.env.ADMIN_SECRET || "super_secret_fallback_key_123",
} as const;

function loadEnv(): void {
    const envName = process.env.NODE_ENV;

    dotenv.config();

    if (envName) {
        dotenv.config({
            path: path.resolve(__dirname, `.env.${envName}`),
        });
    }
}