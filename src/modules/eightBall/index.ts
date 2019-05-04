import Discord from "discord.js";
import { ResourceService } from "../../services/resource.service";
import { ResponderBotModule } from "../responderBotModule";

interface IAnswer
{
  weight: number;
  content: string;
}

export default class EightBallModule extends ResponderBotModule
{
  private static readonly MODULE_NAME = "8Ball";
  private resourceService: ResourceService;
  private answers: IAnswer[];

  constructor(client: Discord.Client, resourceService: ResourceService)
  {
    super(client, EightBallModule.MODULE_NAME);
    this.resourceService = resourceService;
    this.answers = new Array<IAnswer>();
    this.resourceService.getAnswers().then((answers: IAnswer[]) =>
    {
      this.answers = answers;
    });
  }

  public getHelpText()
  {
    return {
      content: `__Description__: Ask the Magic 8-Ball a yes/no question\n__Usage__: \`${this.prefix}8ball [question]\``,
      moduleName: EightBallModule.MODULE_NAME,
    };
  }

  protected isValidCommand(content: string): boolean
  {
    return content.startsWith(`${this.prefix}8ball`);
  }

  protected process(message: Discord.Message): string
  {
    const args = message.content.split(" ");
    if (args.length < 2)
    {
      message.reply(`Ask a yes/no question and the 8-ball will reach into the future to find the answer.`);
    }
    else
    {
      this.resourceService.getAnswers().then((answers: IAnswer[]) =>
      {
        this.answers = answers;
        const answer = this.chooseAnswer();
        if (!answer)
        {
          const msg = `The 8-Ball did not foresee this!`;
          throw new Error(msg);
        }
        else
        {
          message.reply(`\n${answer.content}`);
        }
      }).catch((err: Error) =>
      {
        message.reply(`Sorry, I had some trouble fetching that information.\n\n${err.message}`);
      });
    }
    return "";
  }

  private chooseAnswer(): IAnswer | undefined
  {
    const answers = this.answers.filter((a) => a.weight > 0);
    const probabilities = new Array<number>();
    let totalWeight = 0;
    for (const answer of answers)
    {
      probabilities.push(Number(answer.weight));
      totalWeight += Number(answer.weight);
    }

    let randomIndex = -1;
    let random = Math.random() * probabilities.length;
    for (const [index, prob] of probabilities.entries())
    {
      random -= prob;
      if (random < 0)
      {
        randomIndex = index;
        break;
      }
    }
    return answers[randomIndex];
  }
}
