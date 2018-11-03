import Discord from "discord.js";

import BaseModule from "./baseModule";
import { IBotModule, IHelp } from "./botModule";

import logger from "../logger";

export abstract class ResponderBotModule extends BaseModule implements IBotModule
{
    protected readonly prefix: string;

    constructor(client: Discord.Client, moduleName: string, prefix: string)
    {
        super(client, moduleName);
        this.prefix = prefix;
    }

    public handleMessage(message: Discord.Message): void
    {
        if (message.content.startsWith(this.prefix) && this.isValidCommand(message.content))
        {
            logger.info(`[${this.moduleName}] <- [${message.content}]`);
            const response = this.process(message);
            logger.info(`[${this.moduleName}] -> [${response}]`);
        }
    }

    public start(): void
    {
        // Nothing to start
    }

    public abstract getHelpText(): IHelp | null;

    protected abstract process(message: Discord.Message): void;

    protected abstract isValidCommand(content: string): boolean;
}
