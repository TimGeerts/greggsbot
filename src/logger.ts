import { TransformableInfo } from "logform";
import winston, { createLogger, format } from "winston";

const customFormat = format.printf((info: TransformableInfo) =>
{
    return `${info.timestamp} [${info.level}] ${info.message}`;
});

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        customFormat,
    ),
    level: "info",
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "log/out.log" }),
        new winston.transports.File({ filename: "log/exceptions.log", handleExceptions: true }),
    ],
});

logger.exitOnError = false;

export default logger;
