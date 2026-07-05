import { config } from "@/config";
import winston, { format } from "winston";

export const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    level: config.loggingLevel,
    silent: false,
    format: format.combine(
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        format.printf(({ timestamp, level, message }) => {
            const coloredLevel = format.colorize().colorize(level, level.toUpperCase());

            return `[${timestamp}] [${coloredLevel}] ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

