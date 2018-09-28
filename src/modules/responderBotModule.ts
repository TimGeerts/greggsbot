import Discord from "discord.js";
import winston from "winston";

import { IBotModule } from "./botModule";

export abstract class ResponderBotModule implements IBotModule {
    protected readonly prefix: string;
    protected readonly client: Discord.Client;
    protected readonly logger: winston.Logger;
    protected readonly command: string;

    private readonly moduleName: string;

    constructor(client: Discord.Client, logger: winston.Logger, moduleName: string, command: string, prefix: string) {
        this.client = client;
        this.logger = logger;
        this.moduleName = moduleName;
        this.command = command;
        this.prefix = prefix;
    }

    public handleMessage(message: Discord.Message): void {
        if (this.isValidCommand(message.content)) {
            this.logger.info(`[${this.moduleName}] <- ${message.content}]`);
            const response = this.process(message);
            this.logger.info(`[${this.moduleName}] -> ${response}`);
        }
    }

    protected abstract process(message: Discord.Message): string;

    private isValidCommand(content: string): boolean {
        return content.startsWith(`${this.prefix}${this.command}`);
    }
}
