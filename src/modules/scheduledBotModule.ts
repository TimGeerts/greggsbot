import Discord from "discord.js";
import winston from "winston";

import BaseModule from "./baseModule";
import { IBotModule, IHelp } from "./botModule";

export abstract class ScheduledBotModule extends BaseModule implements IBotModule
{
    constructor(client: Discord.Client, logger: winston.Logger, moduleName: string)
    {
       super(client, logger, moduleName);
    }

    public handleMessage(message: Discord.Message): void
    {
        // Do nothing
    }

    public getHelpText(): IHelp | null
    {
        return null;
    }

    public abstract start(): void;
}
