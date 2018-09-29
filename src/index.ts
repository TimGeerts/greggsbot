import winston from "winston";
import GreggsBot from "./bot";

const logger = winston.createLogger({
  format: winston.format.json(),
  level: "info",
});

const discordToken = process.env.DISCORD_TOKEN;
if (discordToken !== undefined) {
  new GreggsBot(logger)
    .start(discordToken)
    .then(logger.info)
    .catch(logger.error);
}
