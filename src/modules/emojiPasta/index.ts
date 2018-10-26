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

    constructor(client: Discord.Client, logger: winston.Logger, prefix: string)
    {
        super(client, logger, EmojiPastaModule.MODULE_NAME, prefix);
        this.pastas = require("../../../resources/emojiPastas.json");
    }

    public getHelpText()
    {
        const pastaKeys = Object.keys(this.pastas)
        .map((key) => `\`${key}\``)
        .join(", ");

        return{
            content: `__Description__: Get emoji pasta straight from the meme factory\n__Usage__: \`!pasta [pasta key]\`\n__Pasta keys__: ${pastaKeys}`,
            moduleName: EmojiPastaModule.MODULE_NAME,
        };
    }

    protected process(message: Discord.Message): string
    {
        const pastaKey = message.content.split(" ")[1];
        if (pastaKey in this.pastas)
        {
            const response = `\n${this.pastas[pastaKey]}`;
            message.reply(response);
        }
        return "";
    }

    protected isValidCommand(content: string): boolean
    {
        return content.startsWith(`${this.prefix}pasta`);
    }
}
