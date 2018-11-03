import Discord from "discord.js";

import GreggsBot from "../../bot";
import { IHelp } from "../botModule";
import { ResponderBotModule } from "../responderBotModule";

export default class HelpModule extends ResponderBotModule
{
    private static readonly MODULE_NAME = "Helper";
    private readonly getBot: () => GreggsBot;

    constructor(client: Discord.Client, getBot: () => GreggsBot)
    {
        super(client, HelpModule.MODULE_NAME);
        this.getBot = getBot;
    }

    public getHelpText()
    {
        return null;
    }

    protected process(message: Discord.Message): string
    {
        const moduleHelps: IHelp[] = [];
        this.getBot().modules.forEach((module) =>
        {
            const moduleHelp = module.getHelpText();
            if (moduleHelp !== null)
            {
                moduleHelps.push(moduleHelp);
            }
        });

        message.reply(`Alright love, I'm Greggs Bot and here's what I can do:${this.helpToText(moduleHelps)}`);
        return "Help text is a bit long..."; // TODO
    }

    protected isValidCommand(content: string): boolean
    {
        return content.substring(1) === "ghelp";
    }

    private helpToText(helps: IHelp[]): string
    {
        return helps.map((help) =>
        {
            return `\n__**${help.moduleName}**__\n${help.content}`;
        }).join(`\n`);
    }
}
