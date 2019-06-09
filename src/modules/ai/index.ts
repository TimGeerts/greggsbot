import Discord from 'discord.js';
import { ResourceService } from '../../services/resource.service';
import BaseModule from '../baseModule';

interface IReply {
  weight: number;
  content: string;
}

export default class AiModule extends BaseModule {
  private static readonly MODULE_NAME = 'AI';
  private resourceService: ResourceService;
  private replies: IReply[];

  constructor(client: Discord.Client, resourceService: ResourceService) {
    super(client, AiModule.MODULE_NAME);
    this.resourceService = resourceService;
    this.replies = new Array<IReply>();
  }

  public handleMessage(message: Discord.Message): void {
    const content = message.content.toLowerCase();
    if (message.isMentioned(this.client.user)) {
      if (content.includes('play despacito')) {
        message.reply(`Fuck no, my cousin, Alexa, handles those requests...`);
        return;
      }
      if (content.includes('kick') && message.mentions.users.size === 2) {
        message.reply(`Sadly, this is not within my power, learn to get along!`);
        return;
      }
      this.lookupResponse(message);
      return;
    }
  }

  private lookupResponse(message: Discord.Message) {
    this.resourceService
      .getBotResponses()
      .then((responses: IReply[]) => {
        this.replies = responses.filter((r) => r.weight);
        if (this.replies && this.replies.length) {
          const ri = this.getRandomIndex();
          message.reply(this.replies[ri].content);
        } else {
          message.reply('My creator forgot to give me witty responses...');
        }
      })
      .catch((err: Error) => {
        message.reply(`Sorry, I had some trouble fetching that information.\n\n${err.message}`);
      });
  }

  private getRandomIndex(): number {
    const probabilities = this.replies.map((r) => r.weight);
    let randomIndex = -1;
    let random = Math.random() * probabilities.length;
    for (const [index, prob] of probabilities.entries()) {
      random -= prob;
      if (random < 0) {
        randomIndex = index;
        break;
      }
    }
    return randomIndex;
  }
}
