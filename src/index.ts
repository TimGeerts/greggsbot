import GreggsBot from "./bot";
import logger from "./logger";

const discordToken = process.env.DISCORD_TOKEN;
if (discordToken !== undefined)
{
  new GreggsBot(logger)
    .start(discordToken)
    .then(() =>
    {
      logger.info(`Server started!`);
    })
    .catch(logger.error);
}
