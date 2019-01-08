import Discord from "discord.js";
import { ResourceService } from "../../services/resource.service";
import { ResponderBotModule } from "../responderBotModule";

interface IPasta
{
  month?: number;
  content: string;
    tags?: string[];
}

interface ISeasonalPasta extends IPasta
{
  season: number;
}

export default class EmojiPastaModule extends ResponderBotModule
{
    private static readonly MODULE_NAME = "Emoji Pasta";
    private resourceService: ResourceService;
    private pastas: IPasta[];

    constructor(client: Discord.Client, resourceService: ResourceService)
    {
      super(client, EmojiPastaModule.MODULE_NAME);
      this.resourceService = resourceService;
      this.pastas = new Array<IPasta>();
      // for this module we have to get the links in constructor seeing as the commands are dynamic and the valid commands as well as the help text needs the commands
      this.resourceService.getPastas().then((pastas: IPasta[]) =>
      {
        this.pastas = pastas;
      });
    }

    public getHelpText()
    {
      const regularPastas = this.pastas.filter((p) => !p.month);
      const validCommands = new Array<string>();
      regularPastas.forEach((p) =>
      {
        if (p.tags !== undefined)
        {
          validCommands.push(...p.tags);
        }
      });
      const pastaKeys = validCommands.map((cmd) => `\`${cmd}\``).join(", ");
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
        const args = message.content.toLowerCase().split(" ");
        this.resourceService.getPastas().then((pastas: IPasta[]) =>
        {
          this.pastas = pastas;
          const pasta = this.lookupPasta(args);
          if (!pasta)
          {
            let msg = `We ran out of pasta!!`;
            msg += `\nBut here, have a cookie :cookie:.`;
            throw new Error(msg);
          }
          else
          {
            message.reply(`\n${pasta.content}`);
          }
        }).catch((err: Error) =>
        {
          message.reply(`Sorry, I had some trouble fetching that information.\n\n${err.message}`);
        });
        return "";
    }

    private lookupPasta(args: string[]): IPasta | undefined
    {
      switch (args.length)
      {
        // No argument, random pasta
        case 1:
          return this.getRandomPasta();
        // Specific pasta
        case 2:
          return this.getSpecificPasta(args[1]);
      }
    }

    private getRandomPasta(): IPasta | undefined
    {
      const regularPastas = this.pastas.filter((p) => !p.month);
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      // Special days (ugly hardcode, fix when more days are added)
      if (month === 9 && day === 11)
      {
          return this.getSpecificPasta(`911`);
      }
      // Seasonal (if any)
      const seasonal = this.getRandomSeasonalPasta(month.toString());
      if (!seasonal)
      {
        // Default random pasta (if any)
        if (regularPastas && regularPastas.length)
        {
          return regularPastas[Math.floor(Math.random() * regularPastas.length)];
        }
        return undefined;
      }
      return seasonal;
    }

    private getRandomSeasonalPasta(month: string): IPasta | undefined
    {
      const pastasForMonth = this.pastas.filter((p) => p.month && p.month.toString() === month);
      if (pastasForMonth && pastasForMonth.length)
      {
        return pastasForMonth[Math.floor(Math.random() * pastasForMonth.length)];
      }
      return undefined;
    }

    private getSpecificPasta(key: string): IPasta | undefined
    {
      return this.pastas.find((p) => p.tags !== undefined && p.tags.map((t) => t.toLowerCase()).indexOf(key.toLowerCase()) > -1);
    }
}
