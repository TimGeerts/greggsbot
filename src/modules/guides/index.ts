import Discord, { RichEmbed } from "discord.js";
import { ResponderBotModule } from "../responderBotModule";

interface IGuide {
  raids: IRaid[];
}

interface IRaid {
  name: string;
  tags: string[];
  bosses: IBoss[];
}

interface IBoss {
  name: string;
  tags: string[];
  description: string;
  thumbnail: string;
  raid: string;
  wowhead: string;
  youtube: string;
  extra: IBossExtraInfo[];
}

interface IBossExtraInfo {
  name: string;
  content: string;
}

interface IGuideCommand {
  boss: string;
  raid: string;
}

export default class GuidesModule extends ResponderBotModule
{
    private static readonly MODULE_NAME = "Raid Guides";
    private readonly guides: IGuide;

    constructor(client: Discord.Client)
    {
        super(client, GuidesModule.MODULE_NAME);
        this.guides = require("../../../resources/bossGuides.json");
    }

    public getHelpText()
    {
      return {
        content: `__Description__: Fetch boss guides like a BOSS.\n__Usage__: \`!guide <raid> <boss>\``,
        moduleName: GuidesModule.MODULE_NAME,
    };
    }

    protected process(message: Discord.Message): string
    {
      const args = message.content.split(" ");
      if (args && args.length)
      {
        if (args.length < 2)
        {
          message.reply("Please add a raid or boss parameter to your command! (e.g. \`!guide uldir taloc\` or \`!guide taloc\`)");
          return "";
        }
        const cmd: IGuideCommand = {
          boss: args.length === 3 ? args[2] : args[1],
          raid: args.length === 3 ? args[1] : "",
        };
        const guide = this.lookupBossGuide(cmd);
        if (guide)
        {
          const embed = new RichEmbed()
          .setTitle(`__${guide.name} Mythic - ${guide.raid}__`)
          .setColor(0xff0000);

          if (guide.thumbnail)
          {
            embed.setThumbnail(guide.thumbnail);
          }
          if (guide.description)
          {
            embed.setDescription(guide.description);
          }
          if (guide.wowhead)
          {
            embed.addField("Wowhead", guide.wowhead, true);
          }
          if (guide.youtube)
          {
            embed.addField("Youtube", guide.youtube);
          }
          if (guide.extra && guide.extra.length)
          {
            guide.extra.forEach((e) =>
            {
              embed.addField(e.name, e.content);
            });
          }
          message.reply(embed);
        }
        else
        {
          let msg = `No guide was found for a boss named "${cmd.boss}"`;
          msg += cmd.raid ? `in a raid named "${cmd.raid}."` : `.`;
          message.reply(`${msg}\nBut here, have a cookie :cookie:.`);
        }
      }
      return "";
    }

    protected isValidCommand(content: string): boolean
    {
      const command = content.replace(/ .*/, "").replace(/!/, "");
      return (command.toLowerCase() === "guide");
    }

    private lookupBossGuide(command: IGuideCommand): IBoss | undefined
    {
      if (command.raid && command.boss)
      {
        const raid = this.lookupRaid(command.raid);
        if (raid)
        {
          return this.lookupBoss(command.boss, raid);
        }
        return undefined;
      }
      if (command.boss)
      {
        return this.lookupBoss(command.boss);
      }
      return undefined;
    }

    private lookupRaid(name: string): IRaid | undefined
    {
      return this.guides.raids.find((r) => r.tags.map((l) => l.toLowerCase()).indexOf(name.toLowerCase()) > -1);
    }

    private lookupBoss(name: string, raid?: IRaid): IBoss | undefined
    {
      if (raid)
      {
        return this.lookupBossForRaid(raid, name);
      }
      const knownraids = this.guides.raids;
      for (const r of knownraids)
      {
        const boss = this.lookupBossForRaid(r, name);
        if (boss)
        {
          return boss;
        }
      }
      return undefined;
    }

    private lookupBossForRaid(raid: IRaid, name: string): IBoss | undefined
    {
      const boss = raid.bosses.find((b) => b.tags.map((l) => l.toLowerCase()).indexOf(name.toLowerCase()) > -1);
      if (boss)
      {
        boss.raid = raid.name;
      }
      return boss;
    }
}
