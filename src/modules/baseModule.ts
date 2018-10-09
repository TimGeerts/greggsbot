import Discord from "discord.js";
import winston from "winston";

export default abstract class BaseModule
{
    protected readonly client: Discord.Client;
    protected readonly logger: winston.Logger;
    protected readonly moduleName: string;

    constructor(client: Discord.Client, logger: winston.Logger, moduleName: string)
    {
        this.client = client;
        this.logger = logger;
        this.moduleName = moduleName;
    }
}
