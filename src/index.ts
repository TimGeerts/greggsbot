import winston from "winston";
import GreggsBot from "./bot";

import Config from "../config.json";

const logger = winston.createLogger({
  format: winston.format.json(),
  level: "info",
});

new GreggsBot(logger)
  .start(Config.discord_token)
  .then(logger.info)
  .catch(logger.error);
