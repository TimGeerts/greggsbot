import Discord from "discord.js";
import winston, { Logger } from "winston";

import { IBotModule } from "./modules/botModule";
import HelpModule from "./modules/help";
import EmojiPastaModule from "./modules/emojiPasta";
import QuickLinksModule from "./modules/quickLinks";
import RaiderIoModule from "./modules/raiderio";
import RaidReminderModule from "./modules/raidReminder";
import RollBotModule from "./modules/roll";
import WarcraftLogsModule from "./modules/warcraftLogs";
import WowTokenPrice from "./modules/wowtoken";

type BotCommand = (message: Discord.Message) => void;

interface IBotCommands {
  [k: string]: BotCommand;
}

export default class GreggsBot {

  private static readonly PREFIX: string = "!";

  public readonly modules: IBotModule[] = [];

  private readonly logger: winston.Logger;
  private readonly client: Discord.Client;

  constructor(logger: winston.Logger)
  {
    this.logger = logger;
    this.client = new Discord.Client();

    this.initListeners();
  }

  public start(token: string): Promise<string>
  {
    return this.client.login(token)
      .then((response: string) =>
      {
        this.initModules();
        return response;
      });
  }

  private initModules(): void
  {
    this.modules.push(new RollBotModule(this.client, this.logger, GreggsBot.PREFIX));
    this.modules.push(new EmojiPastaModule(this.client, this.logger, GreggsBot.PREFIX));
    this.modules.push(new QuickLinksModule(this.client, this.logger, GreggsBot.PREFIX));
    this.modules.push(new RaidReminderModule(this.client, this.logger));
    this.modules.push(new RaiderIoModule(this.client, this.logger, GreggsBot.PREFIX));
    this.modules.push(new WowTokenPrice(this.client, this.logger, GreggsBot.PREFIX));
    this.modules.push(new WarcraftLogsModule(this.client, this.logger, GreggsBot.PREFIX));
    this.modules.push(new HelpModule(this.client, this.logger, GreggsBot.PREFIX, () => this));
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
        this.logger.error(error);
      }
    });
  }

  private handleWarn = (warning: string) =>
  {
    this.logger.warn(warning);
  }

  private handleError = (error: Error) =>
  {
    this.logger.error(error);
  }

  private handleReady = () =>
  {
    this.logger.info(`Logged in as ${this.client.user.tag}`);
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
