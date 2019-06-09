import Discord from 'discord.js';

import BaseModule from './baseModule';
import { IBotModule, IHelp } from './botModule';

export abstract class ScheduledBotModule extends BaseModule implements IBotModule {
  constructor(client: Discord.Client, moduleName: string) {
    super(client, moduleName);
  }

  public handleMessage(message: Discord.Message): void {
    // Do nothing
  }

  public getHelpText(): IHelp | null {
    return null;
  }

  public abstract start(): void;
}
