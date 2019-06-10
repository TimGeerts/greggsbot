import GreggsBot from './bot';

const discordToken = process.env.DISCORD_TOKEN;

if (discordToken !== undefined) {
  new GreggsBot().start(discordToken);
}
