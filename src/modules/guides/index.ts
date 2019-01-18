import Discord, { RichEmbed } from "discord.js";
import { ResourceService } from "../../services/resource.service";
import { ResponderBotModule } from "../responderBotModule";

interface IRaid {
  name: string;
  description: string;
  tags: string[];
  extra: IExtraInfo[];
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
  extra: IExtraInfo[];
}

interface IExtraInfo {
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
    private resourceService: ResourceService;
    private raids: IRaid[];

    constructor(client: Discord.Client, resourceService: ResourceService)
    {
      super(client, GuidesModule.MODULE_NAME);
      this.resourceService = resourceService;
      this.raids = new Array<IRaid>();
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
        this.handleCommand(cmd, message);
      }
      return "";
    }

    protected isValidCommand(content: string): boolean
    {
      const command = content.replace(/ .*/, "").replace(/!/, "");
      return (command.toLowerCase() === "guide");
    }

    private handleCommand(cmd: IGuideCommand, message: Discord.Message)
    {
      this.resourceService.getRaidGuides().then((raids: IRaid[]) =>
      {
        this.raids = raids;
        const guide = this.lookupBossGuide(cmd);
        if (!guide)
        {
          // One more option is to check if the "boss" argument is acutally a raid, so we can list out all available guides for that raid
          const raid = this.lookupRaid(cmd.boss);
          if (!raid)
          {
            let msg = `No guide was found for a boss named "${cmd.boss}"`;
            msg += cmd.raid ? `in a raid named "${cmd.raid}."` : `.`;
            msg += `\nBut here, have a cookie :cookie:.`;
            throw new Error(msg);
          }
          else
          {
            this.replyRaid(raid, message);
          }
        }
        else
        {
          this.replyBoss(guide, message);
        }
      }).catch((err: Error) =>
      {
        message.reply(`Sorry, I had some trouble fetching that information.\n\n${err.message}`);
      });
    }

    private replyBoss(guide: IBoss, message: Discord.Message)
    {
      const embed = new RichEmbed()
      .setTitle(`__${guide.name} Mythic - ${guide.raid}__`)
      .setColor(0xfaa61a);

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

    private replyRaid(raid: IRaid, message: Discord.Message)
    {
      const embed = new RichEmbed()
      .setTitle(`__${raid.name}__`)
      .setColor(0xfaa61a);
      if (raid.description)
      {
        embed.setDescription(raid.description);
      }
      if (raid.bosses && raid.bosses.length)
      {
        let guides = "";
        raid.bosses.forEach((boss) =>
        {
          if (boss.tags && boss.tags.length)
          {
            const firsttag = boss.tags[0];
            guides += `**${boss.name}:** \`!guide ${firsttag}\`\n`;
          }
        });
        embed.addField("__Available guide commands__", guides);
      }
      if (raid.extra && raid.extra.length)
      {
        let extras = "";
        raid.extra.forEach((e) =>
        {
          extras += `**${e.name}:** ${e.content}\n`;
        });
        embed.addField("__Extras__", extras);
      }
      message.reply(embed);
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
      return this.raids.find((r) => r.tags.map((l) => l.toLowerCase()).indexOf(name.toLowerCase()) > -1);
    }

    private lookupBoss(name: string, raid?: IRaid): IBoss | undefined
    {
      if (raid)
      {
        return this.lookupBossForRaid(raid, name);
      }
      for (const r of this.raids)
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
      if (raid.bosses)
      {
        const boss = raid.bosses.find((b) => b.tags.map((l) => l.toLowerCase()).indexOf(name.toLowerCase()) > -1);
        if (boss)
        {
          boss.raid = raid.name;
        }
        return boss;
      }
      return undefined;
    }
}
