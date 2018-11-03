import Discord, { MessageEmbed, RichEmbed } from "discord.js";
import moment from "moment";
import fetch, {Response} from "node-fetch";

import { IHelp } from "../botModule";
import { ResponderBotModule } from "../responderBotModule";

export default class WowTokenPrice extends ResponderBotModule
{
    private static readonly MODULE_NAME = "Wow Token Price";

    private static GBP_COST = 15.00;
    private static EUR_COST = 20.00;

    constructor(client: Discord.Client)
    {
        super(client, WowTokenPrice.MODULE_NAME);
    }

    public getHelpText(): IHelp
    {
        return {
            content: `__Description__: Find out how shite value WoW Tokens are.\n__Usage__: \`!token\``,
            moduleName: WowTokenPrice.MODULE_NAME,
        };
    }

    protected process(message: Discord.Message): void
    {
        fetch("https://wowtokenprices.com/current_prices.json", {method: "GET"})
        .then((response: Response) =>
        {
            if (response.ok === false)
            {
                message.reply("Something went wrong, sorry. Fuck you.");
            }

            return response.json();
        })
        .then((response: IWowTokenPriceResponse) =>
        {
            const price = response.eu.current_price;
            const lastChange = response.eu.last_change;
            const timestamp = moment(response.eu.time_of_last_change_unix_epoch * 1000)
                .format("Do MMM YYYY HH:mm:SS");

            const gbpToGold = (price / WowTokenPrice.GBP_COST).toLocaleString("en-GB", {maximumFractionDigits: 2});
            const eurToGold = (price / WowTokenPrice.EUR_COST).toLocaleString("en-GB", {maximumFractionDigits: 2});

            const embed = new RichEmbed()
                .setTitle("WoW Token Price")
                .setURL("https://wowtokenprices.com/")
                .setDescription(`EU token price`)
                .setColor("0x00558F")
                .addField("Sell (g)", `${price.toLocaleString("en-GB")}G`, false)
                .addField("Change", `${lastChange.toLocaleString("en-GB")}G`, false)
                .addField("£/g", `${gbpToGold}G`, false)
                .addField("€/g", `${eurToGold}G`, false)
                .setFooter(timestamp);

            message.reply(embed);
        });
    }

    protected isValidCommand(content: string): boolean
    {
        return content.startsWith(`${this.prefix}token`);
    }
}

interface IWowTokenPriceResponse
{
    eu: {
        current_price: number;
        last_change: number;
        time_of_last_change_unix_epoch: number;
    };
}
