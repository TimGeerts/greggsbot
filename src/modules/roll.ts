import Discord from "discord.js";
import winston, { Logger } from "winston";

import { ResponderBotModule } from "./responderBotModule";

export default class RollBotModule extends ResponderBotModule {
    private readonly MAX = 100;
    private readonly MIN = 1;

    constructor(client: Discord.Client, logger: winston.Logger, prefix: string) {
        super(client, logger, "Roll", "roll", prefix);
    }

    protected process(message: Discord.Message): string {
        const roll = Math.floor(Math.random() * (100 - 1 + 1) + 1);
        const response = this.getResponseFromRoll(roll, message);
        message.channel.send(response);
        return response;
    }

    private getResponseFromRoll(roll: number, message: Discord.Message): string {
        let response = `🎲 ${message.author.username} rolls... `;

        if (roll === this.MAX) {
            response += `💯💯💯💯`;
        } else if (roll === this.MIN) {
            response += `1... no surprises there 💩`;
        } else if (roll === 69) {
            response += `69! That's the sex number 🍆💦`;
        } else {
            response += roll;
        }

        return response;
    }
}
