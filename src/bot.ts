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

type BotCommand = (message: Discord.Message) => void;

interface IBotCommands {
  [k: string]: BotCommand;
}

export default class GreggsBot {

  private static readonly PREFIX: string = "!";

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
    this.modules.push(new RollBotModule(this.client, GreggsBot.PREFIX));
    this.modules.push(new EmojiPastaModule(this.client, GreggsBot.PREFIX));
    this.modules.push(new QuickLinksModule(this.client, GreggsBot.PREFIX));
    this.modules.push(new RaidReminderModule(this.client));
    this.modules.push(new RaiderIoModule(this.client, GreggsBot.PREFIX));
    this.modules.push(new WowTokenPrice(this.client, GreggsBot.PREFIX));
    this.modules.push(new WarcraftLogsModule(this.client, GreggsBot.PREFIX));
    this.modules.push(new HelpModule(this.client, GreggsBot.PREFIX, () => this));
    this.modules.forEach((m) => m.start());
  }

  private initListeners(): void
  {
    this.client.on("ready", this.handleReady);
    this.client.on("error", this.handleError);
    this.client.on("warn", this.handleWarn);
    this.client.on("message", (message) =>
    {
      try
      {
        this.handleMessage(message);
      }
      catch (error)
      {
        logger.error(error);
      }
    });
  }

  private handleWarn = (warning: string) =>
  {
    logger.warn(warning);
  }

  private handleError = (error: Error) =>
  {
    logger.error(error);
  }

  private handleReady = () =>
  {
    logger.info(`Logged in as ${this.client.user.tag}`);
  }

  private handleMessage = (message: Discord.Message) =>
  {
    if (!message.content.startsWith(GreggsBot.PREFIX) || message.author.bot || message.guild === null)
    {
      return;
    }

    this.modules.forEach((m) => m.handleMessage(message));
  }
}
