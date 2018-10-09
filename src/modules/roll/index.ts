import Discord from "discord.js";
import winston, { Logger } from "winston";

import { IHelp } from "../botModule";
import { ResponderBotModule } from "../responderBotModule";

export default class RollBotModule extends ResponderBotModule
{
    private static readonly MODULE_NAME = "Roll";
    private readonly DEFAULT_MAX = 100;
    private readonly MIN = 1;

    constructor(client: Discord.Client, logger: winston.Logger, prefix: string)
    {
        super(client, logger, RollBotModule.MODULE_NAME, prefix);
    }

    public getHelpText()
    {
        return {
            content: `__Description__: Roll the die! 1-100\n__Usage__: \`!roll [max]\`\n__Examples__: \`!roll\`, \`!roll 200\``,
            moduleName: RollBotModule.MODULE_NAME,
        };
    }

    protected isValidCommand(content: string): boolean
    {
        return content.startsWith(`${this.prefix}roll`);
    }

    protected process(message: Discord.Message): string
    {
        const args = message.content.split(" ");
        let max = this.DEFAULT_MAX;
        if (args.length > 1)
        {
            max = parseInt(args[1], 10) || this.DEFAULT_MAX;
            if (max < this.MIN)
            {
                max = this.DEFAULT_MAX;
            }
        }

        const roll = Math.floor(Math.random() * (max - this.MIN + 1) + this.MIN);
        const response = this.getResponseFromRoll(roll, max, message);
        message.reply(response);
        return response;
    }

    private getResponseFromRoll(roll: number, max: number, message: Discord.Message): string
    {
        let response = `🎲 rolls... `;

        if (roll === 100)
        {
            response += `💯💯💯💯`;
        }
        else if (roll === max)
        {
            response += `${max} FUUUUUUUUUUUCK`;
        }
        else if (roll === this.MIN)
        {
            response += `1... no surprises there 💩`;
        }
        else if (roll === 69)
        {
            response += `69! That's the sex number 🍆💦`;
        }
        else if (roll === 22)
        {
            response += `two little ducks, 22 🦆🦆`;
        }
        else if (roll === 88)
        {
            response += `two fat ladies, 88 🍩`;
        }
        else
        {
            response += roll;
        }

        return response;
    }
}
