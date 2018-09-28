import Discord from "discord.js";

export interface IBotModule {
    handleMessage(message: Discord.Message): void;
}
