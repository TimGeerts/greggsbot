import Discord from 'discord.js';

export interface IHelp {
  moduleName: string;
  content: string;
}

export interface IBotModule {
  handleMessage(message: Discord.Message): void;
  start(): void;
  getHelpText(): IHelp | null;
  log(message: string): void;
}
