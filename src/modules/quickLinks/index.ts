import Discord from "discord.js";

import { ResponderBotModule } from "../responderBotModule";

interface IQuickLinkRefs
{
    [k: string]: any;
    string: any;
}

export default class QuickLinksModule extends ResponderBotModule
{
    private static readonly MODULE_NAME = "Quick Links";
    private readonly links: IQuickLinkRefs;

    constructor(client: Discord.Client, prefix: string)
    {
        super(client, QuickLinksModule.MODULE_NAME, prefix);
        this.links = require("../../../resources/quickLinks.json");
    }

    public getHelpText()
    {
        const commands = Object.keys(this.links)
        .map((key) => `\`${this.prefix}${key}\``)
        .join(" or ");

        return {
            content: `__Description__: Get links fucking quick\n__Usage__: ${commands}`,
            moduleName: QuickLinksModule.MODULE_NAME,
        };
    }

    protected process(message: Discord.Message): string
    {
        const maybeLinkName = message.content.substring(1);
        const response = `\n<${this.links[maybeLinkName]}>`;
        message.reply(response);
        return response;
    }

    protected isValidCommand(content: string): boolean
    {
       const maybeLinkName = content.substring(1);
       return (maybeLinkName in this.links);
    }
}
