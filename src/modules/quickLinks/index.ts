import Discord from "discord.js";
import { ResourceService } from "../../services/resource.service";
import { ResponderBotModule } from "../responderBotModule";

interface IQuickLink
{
  content: string;
  tags: string[];
}

export default class QuickLinksModule extends ResponderBotModule
{
    private static readonly MODULE_NAME = "Quick Links";
    private resourceService: ResourceService;
    private links: IQuickLink[];

    constructor(client: Discord.Client, resourceService: ResourceService)
    {
      super(client, QuickLinksModule.MODULE_NAME);
      this.resourceService = resourceService;
      this.links = new Array<IQuickLink>();
      // for this module we have to get the links in constructor seeing as the commands are dynamic and the valid commands as well as the help text needs the commands
      this.resourceService.getQuickLinks().then((links: IQuickLink[]) =>
      {
        this.links = links;
      });
    }

    public getHelpText()
    {
        // const commands = Object.keys(this.links)
        const validCommands = new Array<string>();
        this.links.forEach((l) =>
        {
          validCommands.push(...l.tags);
        });
        const commands = validCommands.map((cmd) => `\`${cmd}\``).join(", ");
        return {
            content: `__Description__: Get links fucking quick\n__Usage__: ${commands}`,
            moduleName: QuickLinksModule.MODULE_NAME,
        };
    }

    protected process(message: Discord.Message): string
    {
      this.resourceService.getQuickLinks().then((links: IQuickLink[]) =>
      {
        this.links = links;
        const cmd = message.content.substring(1);
        const link = this.lookupQuickLink(cmd);
        if (!link)
        {
          let msg = `No link was found for the command "${cmd}"`;
          msg += `\nBut here, have a cookie :cookie:.`;
          throw new Error(msg);
        }
        else
        {
          message.reply(`\n<${link.content}>`);
        }
      }).catch((err: Error) =>
      {
        message.reply(`Sorry, I had some trouble fetching that information.\n\n${err.message}`);
      });
      return "";
    }

    protected isValidCommand(content: string): boolean
    {
       const maybeLinkName = content.substring(1);
       const link = this.lookupQuickLink(maybeLinkName);
       return !!link;
    }

    private lookupQuickLink(key: string): IQuickLink | undefined
    {
      return this.links.find((l) => l.tags.map((t) => t.toLowerCase()).indexOf(key.toLowerCase()) > -1);
    }
}
