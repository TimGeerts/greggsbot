import GreggsBot from "./bot";
import logger from "./logger";

const discordToken = process.env.DISCORD_TOKEN;

if (discordToken !== undefined)
{
  new GreggsBot().start(discordToken);
}
