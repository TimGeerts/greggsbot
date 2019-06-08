import Discord, { RichEmbed } from "discord.js";
import fetch from "node-fetch";
import logger from "../../logger";
import { ResponderBotModule } from "../responderBotModule";

interface IRaiderIORankCommand
{
    name: string;
    realm: string;
    region: string;
}

interface IRaiderIOCheckCommand
{
    name: string;
    realm: string;
    region: string;
    role: string;
}

enum RaiderIOCommand
{
    RANK = "rank",
    CHECK = "check",
}

export default class RaiderIoModule extends ResponderBotModule
{
    private static readonly MODULE_NAME = "Raider IO Module";

    private readonly REGIONS = ["EU", "US", "KR", "TW"];
    private readonly RAIDER_IO_GUILD_URL = "https://raider.io/api/v1/guilds/profile";
    private readonly RAIDER_IO_CHAR_URL = "https://raider.io/api/v1/characters/profile";

    constructor(client: Discord.Client)
    {
        super(client, RaiderIoModule.MODULE_NAME);
    }

    public getHelpText()
    {
        const description = "__Description__: Instantly query Raider IO for guild or character rankings.";
        const rankHelp = `__Usage (guild ranks)__: \`!rank [guild] [realm] [region]\`\n__Examples__: \`!rank\`, \`!rank Fresh\``;
        const checkHelp = `__Usage (character ranks)__: \`!check [character] [realm] [region] [role]\`\n__Examples__: \`!check Chipstocks\`, \`!check Chipstocks tank\``;
        const checkExtraInfoOnRoles = `__Possible roles__: \`tank\`, \`healer\`, \`dps\``;

        return {
            content: `${description}\n${rankHelp}\n${checkHelp}\n${checkExtraInfoOnRoles}`,
            moduleName: RaiderIoModule.MODULE_NAME,
        };
    }

    protected process(message: Discord.Message): string
    {
        const args = message.content.split(" ");
        if (args && args.length)
        {
            const command = this.getActualCommand(args[0]);
            switch (command)
            {
                case RaiderIOCommand.RANK:
                {
                    const cmd: IRaiderIORankCommand = {
                        name: args.length >= 2 ? args[1] : "Greggs",
                        realm: args.length >= 3 ? args[2] : "Draenor",
                        region: args.length >= 4 ? args[3].toUpperCase() : "EU",
                    };
                    return this.executeRioRank(message, cmd);
                }

                case RaiderIOCommand.CHECK:
                {
                    const roleArg = this.findAndRemoveRoleParameter(args);
                    const cmd: IRaiderIOCheckCommand = {
                        name: args.length >= 2 ? args[1] : "Chipstocks",
                        realm: args.length >= 3 ? args[2] : "Draenor",
                        region: args.length >= 4 ? args[3].toUpperCase() : "EU",
                        role: roleArg,
                    };
                    return this.executeRioCheck(message, cmd);
                }
            }
        }
        return "";
    }

    protected executeRioRank(message: Discord.Message, command: IRaiderIORankCommand): string
    {
      // Meme override
      if (command.name.toLowerCase() === "quick")
      {
          const response = "Quick? Didn't they disband? RIP.";
          message.reply(response);
          return response;
      }

      if (command.name.toLowerCase() === "fresh")
      {
          const response = "Fresh? Don't you mean 'STALE'?!";
          message.reply(response);
          return response;
      }

      if (this.REGIONS.indexOf(command.region) === -1)
      {
          message.reply(`Where the fuck is ${command.region}? Try one of ${this.REGIONS.join(", ")}.`);
          return "";
      }

      const URL = `${this.RAIDER_IO_GUILD_URL}?name=${command.name}&realm=${command.realm}&region=${command.region}&fields=raid_rankings,raid_progression`;
      
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
          `S ${this.ordinal_suffix_of(raiderIo.raid_rankings["battle-of-dazaralor"].mythic.realm)} / ` +
          `R ${this.ordinal_suffix_of(raiderIo.raid_rankings["battle-of-dazaralor"].mythic.region)}`;

          const uldirHeroic =
          `S ${this.ordinal_suffix_of(raiderIo.raid_rankings["battle-of-dazaralor"].heroic.realm)} / ` +
          `R ${this.ordinal_suffix_of(raiderIo.raid_rankings["battle-of-dazaralor"].heroic.region)}`;

          const uldirNorm =
          `S ${this.ordinal_suffix_of(raiderIo.raid_rankings["battle-of-dazaralor"].normal.realm)} / ` +
          `R ${this.ordinal_suffix_of(raiderIo.raid_rankings["battle-of-dazaralor"].normal.region)}`;

          const mythicSummary = `BoD M ${raiderIo.raid_progression["battle-of-dazaralor"].mythic_bosses_killed}/${raiderIo.raid_progression["battle-of-dazaralor"].total_bosses}`;
          const heroicSummary = `BoD HC ${raiderIo.raid_progression["battle-of-dazaralor"].heroic_bosses_killed}/${raiderIo.raid_progression["battle-of-dazaralor"].total_bosses}`;
          const normalSummary = `BoD N ${raiderIo.raid_progression["battle-of-dazaralor"].normal_bosses_killed}/${raiderIo.raid_progression["battle-of-dazaralor"].total_bosses}`;

          const embed = new RichEmbed()
              .setTitle("Raider.IO Rankings")
              .setColor(0xFF0000)
              .setDescription(`<${command.name}> ${command.realm}-${command.region}`)
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

    protected executeRioCheck(message: Discord.Message, command: IRaiderIOCheckCommand): string
    {
        if (this.REGIONS.indexOf(command.region) === -1)
        {
            message.reply(`Where the fuck is ${command.region}? Try one of ${this.REGIONS.join(", ")}.`);
            return "";
        }

        if (command.name.toLowerCase() === "lightslayers")
        {
            message.reply("Raider.io scores? LuL, might as well go back to gearscore, that was awful too!!");
            return "";
          }

        const URL = `${this.RAIDER_IO_CHAR_URL}?name=${command.name}&realm=${command.realm}&region=${command.region}&fields=guild,mythic_plus_scores,mythic_plus_ranks`;
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
            const maxScoreAndRole = this.maxMythicPlusScore(raiderIo.mythic_plus_scores);
            const roleToCheck = command.role || maxScoreAndRole.role;
            const roleToCheckLabel = roleToCheck === "dps" ? roleToCheck.toUpperCase() : `${roleToCheck[0].toUpperCase()}${roleToCheck.slice(1)}s`;
            const embed = new RichEmbed()
                .setTitle(`M+ Rankings for ${command.name} (${command.realm}-${command.region})`)
                .setColor(0xfaa61a)
                .setDescription(`Best score: **${maxScoreAndRole.score}** [${maxScoreAndRole.role}]`)
                .addField("All Classes & Roles", this.checkRankForMedal(raiderIo.mythic_plus_ranks.overall.realm), true)
                .addField(`All ${roleToCheckLabel}`, this.checkRankForMedal(raiderIo.mythic_plus_ranks[roleToCheck].realm), true)
                .addField(`All ${raiderIo.class} ${roleToCheckLabel}`, this.checkRankForMedal(raiderIo.mythic_plus_ranks[`class_${roleToCheck}`].realm), true)
                .setURL(raiderIo.profile_url);

            message.reply(embed);
        })
        .catch((maybeRaiderIoError: IRaiderIOError) =>
        {
            message.reply("Sorry, I had some trouble fetching that information.");
        });

        return "";
    }

    protected isValidCommand(content: string): boolean
    {
        const validCommands = Object.keys(RaiderIOCommand).map((key) => `${RaiderIOCommand[key as any]}`);
        const command = this.getActualCommand(content); // Gets first word up till space (which is the command, with ! removed)
        return validCommands.indexOf(command) > -1;
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

    private getActualCommand(content: string): string
    {
        return content.replace(/ .*/, "").replace(/!/, "");
    }

    private maxMythicPlusScore(score: IMythicPlusScores): IMythicPluseScore
    {
        const arr = Object.keys(score).filter((key) => key !== "all").map((s) =>
        {
            return { role: s, score: score[s]};
        });

        const sorted = arr.sort((a, b) => b.score - a.score);
        return sorted[0];
    }

    private checkRankForMedal(rank: number): string
    {
        const medals = [":first_place:", ":second_place:", ":third_place:"];
        if (rank === 0)
        {
            return "0";
        }
        else
        {
            return rank < medals.length ? medals[rank - 1] : rank.toString();
        }
    }

    private findAndRemoveRoleParameter(args: string[]): string
    {
        const roleArgs = ["tank", "healer", "dps"];
        const role = args.find((a) => roleArgs.indexOf(a) > -1) || "";
        const idx = args.findIndex((a) => a === role);
        if (idx > -1)
        {
            args.splice(idx, 1);
        }
        return role;
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
    // "uldir": T;
    "battle-of-dazaralor": T;
}

export interface IMythicPlusData<T>{
    overall: T;
    dps: T;
    healer: T;
    tank: T;
    class: T;
    class_dps: T;
    class_healer: T;
    class_tank: T;
    [key: string]: T;
}

interface IRaidProgression
{
    summary: string;
    total_bosses: number;
    normal_bosses_killed: number;
    heroic_bosses_killed: number;
    mythic_bosses_killed: number;
}

interface IMythicPlusRank
{
    world: number;
    region: number;
    realm: number;
}

interface IMythicPlusScores{
    all: number;
    dps: number;
    healer: number;
    tank: number;
    [key: string]: number;
}

interface IMythicPluseScore{
    role: string;
    score: number;
}

export interface IRaiderIOResponse
{
    name: string;
    race: string;
    class: string;
    faction: string;
    region: string;
    realm: string;
    profile_url: string;
    thumbnail_url: string;
    raid_rankings: IRaidData<IRaidRanking>;
    raid_progression: IRaidData<IRaidProgression>;
    mythic_plus_scores: IMythicPlusScores;
    mythic_plus_ranks: IMythicPlusData<IMythicPlusRank>;
}

export interface IRaiderIOError
{
    statusCode: number;
    error: string;
    message: string;
}
