import Discord from 'discord.js';
import moment from 'moment';
import fetch from 'node-fetch';

import { IHelp } from '../botModule';
import { ResponderBotModule } from '../responderBotModule';

export default class WarcraftLogsModule extends ResponderBotModule {
  private static readonly MODULE_NAME = 'Warcraft Logs';

  private readonly WCL_TOKEN = process.env.WCL_TOKEN;
  private readonly MAX_LOGS = 3;

  constructor(client: Discord.Client) {
    super(client, WarcraftLogsModule.MODULE_NAME);
  }

  public getHelpText(): IHelp {
    return {
      content: `__Description__: Fetch latest logs.\n__Usage__: \`!wcl\``,
      moduleName: WarcraftLogsModule.MODULE_NAME
    };
  }

  protected process(message: Discord.Message): void {
    if (this.WCL_TOKEN === undefined) {
      this.log('no WCL_TOKEN variable found', 'error');
      return;
    }

    fetch(this.url, { method: 'GET' })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        throw new Error('Error encountered fetching data from the server.');
      })
      .then((response: IWCLResponse[]) => {
        const logs = response.slice(0, this.MAX_LOGS);
        message.reply(this.createMessage(logs));
      })
      .catch((maybeError: string) => {
        message.reply("Couldn't fetch latest logs. Try guild page at https://www.warcraftlogs.com/guild/id/219370");
      });
  }

  protected isValidCommand(content: string): boolean {
    return content.startsWith(`${this.prefix}wcl`);
  }

  private get url(): string {
    return `https://www.warcraftlogs.com:443/v1/reports/guild/Greggs/Draenor/EU?api_key=${this.WCL_TOKEN}`;
  }

  private createMessage(logs: IWCLResponse[]): Discord.RichEmbed {
    const message = new Discord.RichEmbed();

    logs.forEach((log) => {
      const date = moment(log.start).format('Do MMM YYYY HH:mm:SS');
      const url = `https://www.warcraftlogs.com/reports/${log.id}`;
      message.addField(date, url, false);
    });

    message.setTitle('<Greggs> Warcraft Logs');
    message.setDescription(`Latest ${this.MAX_LOGS}`);
    message.setURL('https://www.warcraftlogs.com/guild/id/219370');
    message.setColor(0xff0000);

    return message;
  }
}

interface IWCLResponse {
  id: string;
  title: string;
  owner: string;
  start: number;
  end: number;
  zone: number;
}
