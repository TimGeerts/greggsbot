import Discord from "discord.js";
import logger from "../logger";

export default abstract class BaseModule
{
    protected readonly client: Discord.Client;
    protected readonly moduleName: string;

    constructor(client: Discord.Client, moduleName: string)
    {
        this.client = client;
        this.moduleName = moduleName;
    }
}
