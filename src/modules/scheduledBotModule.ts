import Discord from "discord.js";

import { IBotModule } from "./botModule";

export abstract class ScheduledBotModule implements IBotModule {
    public handleMessage(message: Discord.Message): void {
        // Do nothing
    }

    public start(): void {
        // Do nothing
    }
}
