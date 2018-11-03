import Discord from "discord.js";

import { ResponderBotModule } from "../responderBotModule";
import RollDuelManager from "./rollDuelManager";

export default class RollBotModule extends ResponderBotModule
{
    public static GetRollValue(max: number = RollBotModule.DEFAULT_MAX): number
    {
        max = max < 1 ? this.DEFAULT_MAX : max; // Ensure nobody fucks about
        return Math.floor(Math.random() * (max - 2) + 1);
    }

    private static readonly DEFAULT_MAX = 100;
    private static readonly MODULE_NAME = "Roll";

    private readonly duelManager: RollDuelManager;

    constructor(client: Discord.Client)
    {
        super(client, RollBotModule.MODULE_NAME);
        this.duelManager = new RollDuelManager();
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
        switch (args.length)
        {
            // Just roll standard. E.G., !roll
            case 1:
                // Check if there's a roll duel for this person on-going...
                const usedInDuel = this.duelManager.addPlayerRollIfNeeded(message.author);
                if (usedInDuel === false)
                {
                    this.roll(message);
                }

                break;

            // Roll with a set max. E.G., !roll 50
            case 2:
                const maxRoll = parseInt(args[1], 10);
                isNaN(maxRoll)
                    ? this.roll(message)
                    : this.roll(message, maxRoll);

            // Roll duel!. E.G., !roll duel @ionis
            case 3:
                const maybeDuel = args[1];
                const maybeOpponent = args[2];
                if (maybeDuel === "duel" && maybeOpponent.startsWith("<@"))
                {
                    const challenger = message.author;
                    const opponent = message.mentions.users.first();

                    this.duelManager.createDuel(message, challenger, opponent);
                }
                break;
        }

        return "";
    }

    private roll(message: Discord.Message, max: number = RollBotModule.DEFAULT_MAX): void
    {
        message.reply(this.getResponseForRollValue(RollBotModule.GetRollValue(max), max, message));
    }

    private getResponseForRollValue(roll: number, max: number, message: Discord.Message): string
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
        else if (roll === 1)
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
