import winston, {createLogger, format} from "winston";

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.simple(),
    ),
    level: "info",
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "log/error.log", level: "error" }),
        new winston.transports.File({ filename: "log/out.log" }),
    ],
});

export default logger;
