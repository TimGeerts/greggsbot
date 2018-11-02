import Discord from "discord.js";
import winston from "winston";

import { IHelp } from "../botModule";
import { ResponderBotModule } from "../responderBotModule";

interface IEmojiPastaRefs
{
    [k: string]: any;
    string: any;
}

export default class EmojiPastaModule extends ResponderBotModule
{
    private static readonly MODULE_NAME = "Emoji Pasta";
    private readonly pastas: IEmojiPastaRefs;
    private readonly holidayKeys: string[];
    private readonly regularKeys: string[];

    constructor(client: Discord.Client, logger: winston.Logger, prefix: string)
    {
        super(client, logger, EmojiPastaModule.MODULE_NAME, prefix);
        this.pastas = require("../../../resources/emojiPastas.json");
        const holidayKeysKey = `holidayKeys`;
        const holidayKeys = this.pastas[holidayKeysKey];
        this.holidayKeys = holidayKeys;
        this.regularKeys = Object.keys(this.pastas).filter((key) => !(holidayKeys.includes(key) || key === holidayKeysKey));
    }

    public getHelpText()
    {
        const pastaKeys = this.regularKeys
        .map((key: string) => `\`${key}\``)
        .join(", ");

        return{
            content: `__Description__: Get emoji pasta straight from the meme factory\n__Usage__: \`${this.prefix}pasta\` for (seasonal) random or \`${this.prefix}pasta [pasta key]\`\n__Pasta keys__: ${pastaKeys}`,
            moduleName: EmojiPastaModule.MODULE_NAME,
        };
    }

    protected isValidCommand(content: string): boolean
    {
        return content.startsWith(`${this.prefix}pasta`);
    }

    protected process(message: Discord.Message): string
    {
        let response = ``;

        const args = message.content.toLowerCase().split(" ");
        switch (args.length)
        {
            // No argument, random
            case 1:
                response = this.getRandomPasta();
                message.reply(response);
                break;

            // Specific pasta
            case 2:
                const pastaKey = args[1];
                if (this.regularKeys.indexOf(pastaKey) > -1)
                {
                    response = `\n${this.pastas[pastaKey]}`;
                    message.reply(response);
                }
                break;
        }

        return "";
    }

    private getRandomPasta()
    {
        let pastaKey = ``;
        let getFromSeasonalList = false;

        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        // Special days (ugly hardcode, fix when more days are added)
        if (month === 9 && day === 11)
        {
            pastaKey = `911`;
        }
        // Seasonal
        else if (this.holidayKeys.indexOf(String(month)) > -1)
        {
            pastaKey = String(month);
            getFromSeasonalList = true;
        }
        // Regular random
        else
        {
            pastaKey = this.regularKeys[Math.floor(Math.random() * this.regularKeys.length)];
        }

        let response = `\n`;

        if (getFromSeasonalList)
        {
            const seasonalPastas = this.pastas[pastaKey];
            response += `${seasonalPastas[Math.floor(Math.random() * seasonalPastas.length)]}`;
        }
        else
        {
            response += `${this.pastas[pastaKey]}`;
        }

        return response;
    }
}
