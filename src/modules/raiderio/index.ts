import Discord, { RichEmbed } from "discord.js";
import fetch from "node-fetch";
import Url from "url";
import winston from "winston";

import { ResponderBotModule } from "../responderBotModule";

interface IRaiderIORequest
{
    guild: string;
    realm: string;
    region: "eu"| "us"|"kr"| "tw";
}

export default class RaiderIoModule extends ResponderBotModule
{
    private static readonly MODULE_NAME = "Raider IO Module";
    private readonly REGIONS = ["EU", "US", "KR", "TW"];
    private readonly RAIDER_IO_URL = "https://raider.io/api/v1/guilds/profile";

    constructor(client: Discord.Client, logger: winston.Logger, prefix: string)
    {
        super(client, logger, RaiderIoModule.MODULE_NAME, prefix);
    }

    public getHelpText()
    {
        return {
            content: `__Description__: Instantly query Raider IO. Defaults to Greggs, Draenor and then EU.\n__Usage__: \`!rank [guild] [realm] [region]\`\n__Examples__: \`!rank\`, \`!rank Fresh\``,
            moduleName: RaiderIoModule.MODULE_NAME,
        };
    }

    protected process(message: Discord.Message): string
    {
        const args = message.content.split(" ");

        // const searchParams = new URLSearchParams([
        //     ["name", args.length === 2 ? args[1] : "Greggs"],
        //     ["realm", args.length === 3 ? args[2] : "Draenor"],
        //     ["region", args.length === 4 ? args[3] : "eu"],
        //     ["fields", "raid_rankings"],
        // ]);

        // const url = Url.parse(this.RAIDER_IO_URL);
        // url.search = searchParams.toString();

        const name = args.length === 2 ? args[1] : "Greggs";
        const realm = args.length === 3 ? args[2] : "Draenor";
        const region = args.length === 4 ? args[3].toUpperCase() : "EU";

        // Meme override
        if (name.toLowerCase() === "quick")
        {
            const response = "Quick? Didn't they disband? RIP.";
            message.reply(response);
            return response;
        }

        if (this.REGIONS.indexOf(region) === -1)
        {
            message.reply(`Where the fuck is ${region}? Try one of ${this.REGIONS.join(", ")}.`);
            return "";
        }

        const URL = `${this.RAIDER_IO_URL}?name=${name}&realm=${realm}&region=${region}&fields=raid_rankings,raid_progression`;

        fetch(URL, {method: "GET"})
        .then((response) =>
        {
            if (response.ok)
            {
                return response.json();
            }
            throw new Error("");
        })
        .then((raiderIo: IRaiderIOResponse) =>
        {
            const uldirMythicRanks =
            `S ${this.ordinal_suffix_of(raiderIo.raid_rankings.uldir.mythic.realm)} / ` +
            `R ${this.ordinal_suffix_of(raiderIo.raid_rankings.uldir.mythic.region)}`;

            const uldirHeroic =
            `S ${this.ordinal_suffix_of(raiderIo.raid_rankings.uldir.heroic.realm)} / ` +
            `R ${this.ordinal_suffix_of(raiderIo.raid_rankings.uldir.heroic.region)}`;

            const uldirNorm =
            `S ${this.ordinal_suffix_of(raiderIo.raid_rankings.uldir.normal.realm)} / ` +
            `R ${this.ordinal_suffix_of(raiderIo.raid_rankings.uldir.normal.region)}`;

            const mythicSummary = `Uldir M ${raiderIo.raid_progression.uldir.mythic_bosses_killed}/${raiderIo.raid_progression.uldir.total_bosses}`;
            const heroicSummary = `Uldir HC ${raiderIo.raid_progression.uldir.heroic_bosses_killed}/${raiderIo.raid_progression.uldir.total_bosses}`;
            const normalSummary = `Uldir N ${raiderIo.raid_progression.uldir.normal_bosses_killed}/${raiderIo.raid_progression.uldir.total_bosses}`;

            const embed = new RichEmbed()
                .setTitle("Raider.IO Rankings")
                .setColor(0xFF0000)
                .setDescription(`<${name}> ${realm}-${region}`)
                .setFooter(raiderIo.profile_url)
                .addField(mythicSummary, uldirMythicRanks, true)
                .addField(heroicSummary, uldirHeroic, true)
                .addField(normalSummary, uldirNorm, true)
                .setURL(raiderIo.profile_url);

            message.reply(embed);
        }).catch((maybeRaiderIoError: IRaiderIOError) =>
        {
            message.reply("Sorry, I had some trouble fetching that information.");
        });

        return "";
    }

    protected isValidCommand(content: string): boolean
    {
        return content.startsWith(`${this.prefix}rank`);
    }

    private ordinal_suffix_of(i: number): string
    {
        const j = i % 10;
        const k = i % 100;
        if (j === 1 && k !== 11)
        {
            return i + "st";
        }
        if (j === 2 && k !== 12)
        {
            return i + "nd";
        }
        if (j === 3 && k !== 13)
        {
            return i + "rd";
        }
        return i + "th";
    }
}

export interface IGeographicRanking
{
    world: number;
    region: number;
    realm: number;
}

export interface IRaidRanking
{
    normal: IGeographicRanking;
    heroic: IGeographicRanking;
    mythic: IGeographicRanking;
}

export interface IRaidData<T>
{
    // "antorus-the-burning-throne": IRaid;
    // "the-emerald-nightmare": IRaid;
    // "the-nighthold": IRaid;
    // "tomb-of-sargeras": IRaid;
    // "trial-of-valor": IRaid;
    "uldir": T;
}

interface IRaidProgression
{
    summary: string;
    total_bosses: number;
    normal_bosses_killed: number;
    heroic_bosses_killed: number;
    mythic_bosses_killed: number;
}

export interface IRaiderIOResponse
{
    name: string;
    faction: string;
    region: string;
    realm: string;
    profile_url: string;
    raid_rankings: IRaidData<IRaidRanking>;
    raid_progression: IRaidData<IRaidProgression>;
}

export interface IRaiderIOError
{
    statusCode: number;
    error: string;
    message: string;
}
