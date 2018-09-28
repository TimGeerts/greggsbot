import Discord from "discord.js";
import winston, { Logger } from "winston";
import { IBotModule } from "./modules/botModule";
import RollBotModule from "./modules/roll";

type BotCommand = (message: Discord.Message) => void;

interface IBotCommands {
  [k: string]: BotCommand;
}

export default class GreggsBot {

  private static readonly PREFIX: string = "!";

  private readonly logger: winston.Logger;
  private readonly client: Discord.Client;

  private readonly modules: IBotModule[] = [];

  constructor(logger: winston.Logger) {
    this.logger = logger;
    this.client = new Discord.Client();

    this.initListeners();
  }

  public start(token: string): Promise<string> {
    return this.client.login(token);
  }

  private initListeners(): void {
    this.modules.push(new RollBotModule(this.client, this.logger, GreggsBot.PREFIX));

    this.client.on("ready", this.handleReady);
    this.client.on("message", this.handleMessage);
  }

  private handleReady = () => {
    this.logger.info(`Logged in as ${this.client.user.tag}`);
  }

  private handleMessage = (message: Discord.Message) => {
    if (!message.content.startsWith(GreggsBot.PREFIX) || message.author.bot) {
      return;
    }

    this.modules.forEach((m) => m.handleMessage(message));
  }
}
