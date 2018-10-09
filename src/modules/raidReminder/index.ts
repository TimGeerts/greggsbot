import Discord, {Collection} from "discord.js";
import {schedule, validate} from "node-cron";
import winston from "winston";

import { ScheduledBotModule } from "../scheduledBotModule";

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

export default class RaidReminderModule extends ScheduledBotModule
{
    private reminders: IScheduledReminder[] = [];

    constructor(client: Discord.Client, logger: winston.Logger)
    {
        super(client, logger, "RaidReminder");
    }

    public start(): void
    {
        const reminderData: IScheduledReminder[] = require("../../../resources/raidReminder.json");
        this.reminders = this.parseRemindersJson(reminderData);

        this.reminders.forEach((reminder) =>
        {
            schedule(reminder.cron, () => this.sendReminder(reminder));
        });
    }

    private parseRemindersJson(reminderData: IScheduledReminder[]): IScheduledReminder[]
    {
        const result: IScheduledReminder[] = reminderData.filter((entry) =>
        {
            if (entry.disabled)
            {
                return false;
            }

            if (validate(entry.cron) === false)
            {
                this.logger.error(`Invalid cron parsed in "${entry.title}" [${entry.cron}]`);
                return false;
            }

            const channel = this.client.channels.find((ch) => ch.id === entry.channelId);
            if (channel === undefined)
            {
                this.logger.error(`Cannot find channel with ID parsed in "${entry.title}" [${entry.channelId}]`);
                return false;
            }
            else if (channel.type !== "text")
            {
                this.logger.error(`Found channel but it is of the wrong type "${entry.title}" [${channel.type}]`);
                return false;
            }

            const guild = this.client.guilds.find((gd) => gd.id === entry.guildId);
            if (guild === undefined)
            {
                this.logger.error(`Tried to set up scheduler for a guild which client isn't connected to "${entry.title}" [${entry.guildId}]`);
            }

            return true;
        });

        this.logger.info(`Parsed ${result.length} reminders in ${this.moduleName}`);

        return result;
    }

    private sendReminder(reminder: IScheduledReminder): void
    {
        const guild = this.client.guilds.get(reminder.guildId);
        if (guild === undefined)
        {
            this.logger.error(`Could not send scheduled message for guild. Have I been kicked? [${reminder.guildId}]`);
            return;
        }

        const channel = this.client.channels.get(reminder.channelId) as Discord.TextChannel;
        if (channel === undefined)
        {
            this.logger.error(`Could not send scheduled message to channel. It does not exist. [${reminder.channelId}]`);
            return;
        }

        const pingString = this.getPingStringForReminder(reminder, guild);

        channel.send(`${pingString.length > 0 ? `${pingString}\n` : ""}${reminder.message}`);
    }

    private getPingStringForReminder(reminder: IScheduledReminder, guild: Discord.Guild): string
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
                this.logger.error(`Could not find the role for mention. ${mention}]`);
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
