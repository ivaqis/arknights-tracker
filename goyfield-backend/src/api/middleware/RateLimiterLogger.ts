import { logger } from "@/logger.js";
import { Logger } from "express-rate-limit";

export class RateLimiterLogger implements Logger {
    private readonly _name: string;

    public constructor(name?: string) {
        this._name = name ?? "RateLimiterLogger";
    }

    private static getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.stack ?? error.message;
        }

        if (typeof error === "string") {
            return error;
        }

        return JSON.stringify(error, null, 2);
    }

    public error(error: unknown, message: string | undefined): void {
        logger.error(this.getMessage(error, message));
    }

    public warn(error: unknown, message: string | undefined): void {
        logger.warn(this.getMessage(error, message));
    }

    private getMessage(error: unknown, message: string | undefined): string {
        return `${this.getNamePrefix()} ${message}\n${RateLimiterLogger.getErrorMessage(error)}`;
    }

    private getNamePrefix(): string {
        return `[${this._name}]`;
    }
}