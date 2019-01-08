import Discord from "discord.js";
import {schedule, validate} from "node-cron";
import { ResourceService } from "../../services/resource.service";
import { ScheduledBotModule } from "../scheduledBotModule";

import logger from "../../logger";

interface IScheduledReminder
{
    guildId: Discord.Snowflake;
    title: string;
    message: string;
    channelId: Discord.Snowflake;
    cron: string;
    mentions: string[];
    disabled?: boolean;
}

interface IReminder
{
  enabled: boolean;
  cron: string;
  guild: string;
  channel: string;
  mentions: string[];
  title: string;
  message: string;
}

export default class RaidReminderModule extends ScheduledBotModule
{
    private static readonly MODULE_NAME = "RaidReminder";
    private resourceService: ResourceService;
    private reminders: IReminder[] = [];

    constructor(client: Discord.Client, resourceService: ResourceService)
    {
      super(client, RaidReminderModule.MODULE_NAME);
      this.resourceService = resourceService;
      this.reminders = new Array<IReminder>();
    }

    public start(): void
    {
        this.resourceService.getReminders().then((reminders: IReminder[]) =>
        {
          this.reminders = this.parseRemindersJson(reminders);
          this.reminders.forEach((reminder) =>
          {
              schedule(reminder.cron, () => this.sendReminder(reminder));
          });
        }).catch((err: Error) =>
        {
          logger.error(err.message);
        });
    }

    private parseRemindersJson(reminderData: IReminder[]): IReminder[]
    {
        const result: IReminder[] = reminderData.filter((entry) =>
        {
            if (!entry.enabled)
            {
                return false;
            }

            // Uncomment for debug if you want to use your own channels/guilds/mentions to test stuff
            // Make sure to change the ids so they match your own discord server
            // entry.guild = "504796984519950355";
            // entry.channel = "504796985191301150";
            // entry.mentions = ["TestRaider"];

            if (validate(entry.cron) === false)
            {
                logger.error(`Invalid cron parsed in "${entry.title}" [${entry.cron}]`);
                return false;
            }

            const channel = this.client.channels.find((ch) => ch.id === entry.channel);
            if (channel === undefined || channel === null)
            {
                logger.error(`Cannot find channel with ID parsed in "${entry.title}" [${entry.channel}]`);
                return false;
            }
            else if (channel.type !== "text")
            {
                logger.error(`Found channel but it is of the wrong type "${entry.title}" [${channel.type}]`);
                return false;
            }

            const guild = this.client.guilds.find((gd) => gd.id === entry.guild) || process.env.GUILDID;
            if (guild === undefined || guild === null)
            {
                logger.error(`Tried to set up scheduler for a guild which client isn't connected to "${entry.title}" [${entry.guild}]`);
            }

            return true;
        });
        logger.info(`Parsed ${result.length} reminders in ${this.moduleName}`);
        return result;
    }

    private sendReminder(reminder: IReminder): void
    {
        const guild = this.client.guilds.get(reminder.guild);
        if (guild === undefined)
        {
            logger.error(`Could not send scheduled message for guild. Have I been kicked? [${reminder.guild}]`);
            return;
        }

        const channel = this.client.channels.get(reminder.channel) as Discord.TextChannel;
        if (channel === undefined)
        {
            logger.error(`Could not send scheduled message to channel. It does not exist. [${reminder.channel}]`);
            return;
        }

        const pingString = this.getPingStringForReminder(reminder, guild);

        channel.send(`${pingString.length > 0 ? `${pingString}\n` : ""}${reminder.message}`);
    }

    private getPingStringForReminder(reminder: IReminder, guild: Discord.Guild): string
    {
        const idsToMention: Discord.Snowflake[] = [];
        reminder.mentions.forEach((mention) =>
        {
            const guildRole = guild.roles.find((role) =>
            {
                return role.name === mention;
            });

            if (guildRole === undefined)
            {
                logger.error(`Could not find the role for mention. ${mention}]`);
                return;
            }
            else
            {
                idsToMention.push(guildRole.id);
            }
        });

        // TODO - Handle users too.
        return idsToMention
        .map((id) =>
        {
            return `<@&${id}>`;
        })
        .join(" ");
    }
}
