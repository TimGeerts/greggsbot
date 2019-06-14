import Discord from 'discord.js';
import logger from '../logger';

export default abstract class BaseModule {
  protected readonly client: Discord.Client;
  protected readonly moduleName: string;
  protected readonly botChannelId = process.env.BOT_CHAN || '';
  protected readonly botChannel: Discord.TextChannel;

  constructor(client: Discord.Client, moduleName: string) {
    this.client = client;
    this.moduleName = moduleName;
    this.botChannel = client.channels.get(this.botChannelId) as Discord.TextChannel;
    if (this.botChannel === undefined) {
      logger.error(`Channel ${this.botChannelId} not found, channel logging will be disabled.`);
      return;
    }
    // this.log(`Module '${moduleName}' started`);
  }

  /** logs to a specific channel on the discord, the channelId can be set as an environment variable 'BOT_CHAN' */
  public log(message: string, prefix?: string): void {
    if (prefix) {
      prefix = `[${prefix}] - `;
    } else {
      prefix = '';
    }
    this.botChannel.send(`${prefix}${message}`);
  }

  protected isAdmin(message: Discord.Message) {
    return message.member.roles.some((r) => r.name === 'Greggs Bot Maintainer');
  }
}
