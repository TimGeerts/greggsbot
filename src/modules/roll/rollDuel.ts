import Discord from "discord.js";
import { clearTimeout, setTimeout } from "timers";

export default class RollDuel
{
    public readonly challenger: Discord.User;
    public readonly opponent: Discord.User;

    private readonly timeoutMinutes: number = 1;
    private readonly message: Discord.Message;
    private readonly onFinish: (duel: RollDuel) => void;

    private timeoutRef: NodeJS.Timeout | null = null;
    private challengerRoll: number | null = null;
    private opponentRoll: number | null = null;

    constructor(message: Discord.Message, challenger: Discord.User, opponent: Discord.User, onFinish: (duel: RollDuel) => void)
    {
        this.message = message;
        this.challenger = challenger;
        this.opponent = opponent;
        this.onFinish = onFinish;
    }

    public start(): void
    {
        if (this.challenger !== null && this.opponent !== null)
        {
            // Send the message to the challenger, tag the opponent annoucing the duel!
            const response = `${this.challenger.toString()} has challenged ${this.opponent.toString()} to a roll duel! You both have one minute to \`!roll\`.`;
            this.message.channel.sendMessage(response);

            // Start the timer
            this.timeoutRef = setTimeout(() =>
            {
                this.message.channel.sendMessage("⏰ Times up!");

                const missingBothRolls = this.opponentRoll === null && this.challengerRoll === null;
                if (missingBothRolls)
                {
                    this.message.channel.sendMessage("Nobody rolled, what a fucking let down.");
                }
                else
                {
                    const missingRollPlayer = this.opponentRoll === null
                        ? this.opponent
                        : this.challenger;

                    const presentRollPlayer = missingRollPlayer === this.challenger
                        ? this.opponent
                        : this.challenger;

                    this.message.channel.sendMessage(`${missingRollPlayer.toString()} didn't roll in time. What a wet towel. I guess ${presentRollPlayer.toString()} wins! 🎉 Weey!`);
                }

                this.onFinish(this);
            }, this.timeoutMinutes * 60 * 1000);
        }
    }

    public rollForUser(user: Discord.User, roll: number): void
    {
        if (user.id === this.challenger.id)
        {
            // They're challenging themselves... Alrighty, let's handle that!
            if (this.challenger.id === this.opponent.id)
            {
                if ( this.opponentRoll === null && this.challengerRoll !== null)
                {
                    this.setOpponentResponse(roll);
                }
                else if (this.challengerRoll === null && this.opponentRoll !== null)
                {
                    this.setChallengerResponse(roll);
                }
            }

            this.setChallengerResponse(roll);
        }
        else if (user.id === this.opponent.id)
        {
            this.setOpponentResponse(roll);
        }
    }

    private setChallengerResponse(roll: number): boolean
    {
        if (this.challengerRoll !== null)
        {
            return false;
        }
        else
        {
            this.challengerRoll = roll;
            if (this.opponentRoll !== null)
            {
                this.resolve();
                return true;
            }
        }

        return false;
    }

    private setOpponentResponse(roll: number): boolean
    {
        if (this.opponentRoll !== null)
        {
            return false;
        }
        else
        {
            this.opponentRoll = roll;
            if (this.challengerRoll !== null)
            {
                this.resolve();
                return true;
            }
        }

        return false;
    }

    private resolve()
    {
        if (this.timeoutRef !== null)
        {
            clearTimeout(this.timeoutRef);
        }

        if (this.challengerRoll === null || this.opponentRoll === null)
        {
            return;
        }

        if (this.challengerRoll === this.opponentRoll)
        {
            const response = `🔫 Bang! Oh shit, it's a draw... Everyone wins?`;
            this.message.channel.sendMessage(response);
        }
        else
        {
            const winner = this.challengerRoll > this.opponentRoll
                ? this.challenger
                : this.opponent;

            const response = `🔫 Bang! ${this.challengerTag} ${this.challengerRoll} vs ${this.opponentRoll} ${this.opponentTag}` + "\n"
                + `🎉 ${winner.toString()} wins!`;

            this.message.channel.sendMessage(response);
        }

        this.onFinish(this);
    }

    private get opponentTag(): string
    {
        return this.opponent.toString();
    }

    private get challengerTag(): string
    {
        return this.challenger.toString();
    }
}
