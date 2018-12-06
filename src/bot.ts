import Discord from "discord.js";

import { IBotModule } from "./modules/botModule";
import EmojiPastaModule from "./modules/emojiPasta";
import HelpModule from "./modules/help";
import QuickLinksModule from "./modules/quickLinks";
import RaiderIoModule from "./modules/raiderio";
import RaidReminderModule from "./modules/raidReminder";
import RollBotModule from "./modules/roll";
import WarcraftLogsModule from "./modules/warcraftLogs";
import WowTokenPrice from "./modules/wowtoken";

import logger from "./logger";
import GuidesModule from "./modules/guides";

export default class GreggsBot {

  public readonly modules: IBotModule[] = [];

  private readonly client: Discord.Client;

  constructor()
  {
    this.client = new Discord.Client();
    this.initListeners();
  }

  public start(token: string): void
  {
    this.client.login(token)
      .then((response: string) =>
      {
        logger.info(`Client authenticated`);
        this.initModules();
      });
  }

  private initModules(): void
  {
    this.modules.push(new RollBotModule(this.client));
    this.modules.push(new EmojiPastaModule(this.client));
    this.modules.push(new QuickLinksModule(this.client));
    this.modules.push(new RaidReminderModule(this.client));
    this.modules.push(new RaiderIoModule(this.client));
    this.modules.push(new WowTokenPrice(this.client));
    this.modules.push(new WarcraftLogsModule(this.client));
    this.modules.push(new GuidesModule(this.client));
    this.modules.push(new HelpModule(this.client, () => this));
    this.modules.forEach((m) => m.start());
  }

  private initListeners(): void
  {
    this.client.on("ready", () => logger.info(`Logged in as ${this.client.user.tag}`));
    this.client.on("error", (error: string) => logger.error(error));
    this.client.on("warn", (warning: string) => logger.warn(warning));
    this.client.on("message", (message) => this.handleMessage(message));
  }

  private handleMessage = (message: Discord.Message) =>
  {
    try
    {
      const prefix = process.env.PREFIX || "!";
      if (!message.content.startsWith(prefix) || message.author.bot || message.guild === null)
      {
        return;
      }

      this.modules.forEach((m) => m.handleMessage(message));
    }
    catch (error)
    {
      logger.error(error);
    }
  }
}
