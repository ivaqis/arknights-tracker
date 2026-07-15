import { config } from "@/config";
import winston, { format } from "winston";

const newLineSpaced = "\n" + " ".repeat("YYYY-MM-DD HH:mm:ss.SSS [error] ".length);

export const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    level: config.loggingLevel,
    silent: false,
    format: format.combine(
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        format.printf(({ timestamp, level, message }) => {
            const coloredTimestamp = format.colorize().colorize(level, `${timestamp}`);
            const coloredLevel = format.colorize().colorize(level, `[${level.toUpperCase()}]`);
            let spacing = "";
            if (level.length < 5) {
                spacing = " ".repeat(5 - level.length);
            }

            const formattedMessage = `${message}`.replace("\n", newLineSpaced);

            return `${coloredTimestamp} ${spacing}${coloredLevel} ${formattedMessage}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

