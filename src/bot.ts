import Discord from 'discord.js';

import { IBotModule } from './modules/botModule';
import EightBallModule from './modules/eightBall';
import EmojiPastaModule from './modules/emojiPasta';
import HelpModule from './modules/help';
import QuickLinksModule from './modules/quickLinks';
import RaiderIoModule from './modules/raiderio';
import RaidReminderModule from './modules/raidReminder';
import RollBotModule from './modules/roll';
import WarcraftLogsModule from './modules/warcraftLogs';
import WowTokenPrice from './modules/wowtoken';

import logger from './logger';
import AiModule from './modules/ai';
import GuidesModule from './modules/guides';
import { ResourceService } from './services/resource.service';

export default class GreggsBot {
  public readonly modules: IBotModule[] = [];
  private aiModule: AiModule | undefined;
  private readonly client: Discord.Client;
  private readonly resourceService: ResourceService;

  constructor() {
    this.client = new Discord.Client();
    this.resourceService = new ResourceService();
    this.initListeners();
  }

  public start(token: string): void {
    this.client.login(token).then((response: string) => {
      logger.info(`Client authenticated`);
      this.initModules();
    });
  }

  private restart(message: Discord.Message): void {
    const botAdmin = message.member.roles.some((r) => r.name === 'Greggs Bot Maintainer');
    if (botAdmin) {
      logger.info(`Restarting bot...`);
      message.reply('Very well master, restarting, brb...').then(() => {
        this.client.destroy().then(() => process.exit());
      });
    } else {
      message.reply(`No, you're not my master, shame on you for trying to restart me!`);
    }
  }

  private initModules(): void {
    this.aiModule = new AiModule(this.client, this.resourceService);
    this.modules.push(new RollBotModule(this.client));
    this.modules.push(new EightBallModule(this.client, this.resourceService));
    this.modules.push(new EmojiPastaModule(this.client, this.resourceService));
    this.modules.push(new QuickLinksModule(this.client, this.resourceService));
    this.modules.push(new RaidReminderModule(this.client, this.resourceService));
    this.modules.push(new RaiderIoModule(this.client));
    this.modules.push(new WowTokenPrice(this.client));
    this.modules.push(new WarcraftLogsModule(this.client));
    this.modules.push(new GuidesModule(this.client, this.resourceService));
    this.modules.push(new HelpModule(this.client, () => this));
    this.modules.forEach((m) => m.start());
    // leverage the basemodule logging function to avoid double coding
    if (this.modules && this.modules.length) {
      this.modules[0].log(':robot: bot started bleep bloop bleep bloop :robot:');
    }
  }

  private initListeners(): void {
    this.client.on('ready', () => logger.info(`Logged in as ${this.client.user.tag}`));
    this.client.on('error', (error: string) => logger.error(error));
    this.client.on('warn', (warning: string) => logger.warn(warning));
    this.client.on('message', (message) => this.handleMessage(message));
  }

  private handleMessage = (message: Discord.Message) => {
    try {
      const prefix = process.env.PREFIX || '!';
      if (message.isMentioned(this.client.user) && this.aiModule) {
        if (message.content.toLowerCase().includes('restart')) {
          this.restart(message);
        } else {
          this.aiModule.handleMessage(message);
        }
      } else if (!message.content.startsWith(prefix) || message.author.bot || message.guild === null) {
        return;
      } else {
        this.modules.forEach((m) => m.handleMessage(message));
      }
    } catch (error) {
      logger.error(error);
    }
  };
}
