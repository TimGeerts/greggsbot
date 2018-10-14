import Discord, { DiscordAPIError } from "discord.js";

import RollBotModule from ".";
import RollDuel from "./rollDuel";

export default class RollDuelManager
{
    private userIdToWaitingDuel: Map<Discord.Snowflake, RollDuel[]> = new Map();

    public createDuel(message: Discord.Message, challenger: Discord.User, opponent: Discord.User): RollDuel
    {
        const duel = new RollDuel(message, challenger, opponent, (rollDuel: RollDuel) => this.onDuelFinish(rollDuel));

        this.updateUserDuelMap(challenger, duel);
        this.updateUserDuelMap(opponent, duel);

        duel.start();
        return duel;
    }

    public addPlayerRollIfNeeded(user: Discord.User): boolean
    {
        const maybeDuels = this.userIdToWaitingDuel.get(user.id);
        if (maybeDuels === undefined)
        {
            return false;
        }
        else
        {
            if (maybeDuels.length === 0)
            {
               this.userIdToWaitingDuel.delete(user.id);
               return false;
            }

            const duel = maybeDuels.pop(); // More checks... We might have an empty array here for some reason even though we just checked for that
            if (duel !== undefined)
            {
                const roll = RollBotModule.GetRollValue();
                duel.rollForUser(user, roll);
                return true;
            }
        }

        return false;
    }

    private updateUserDuelMap(user: Discord.User, duel: RollDuel): void
    {
        const opponentDuels = this.userIdToWaitingDuel.get(user.id);
        opponentDuels === undefined
            ? this.userIdToWaitingDuel.set(user.id, [duel])
            : opponentDuels.push(duel);
    }

    private onDuelFinish(duel: RollDuel): void
    {
        const challengerDuels = this.userIdToWaitingDuel.get(duel.challenger.id);
        if (challengerDuels !== undefined)
        {
           const index = challengerDuels.indexOf(duel);
           if (index > -1)
           {
              challengerDuels.splice(index, 1);
           }
        }

        const opponentDuels = this.userIdToWaitingDuel.get(duel.opponent.id);
        if (opponentDuels !== undefined)
        {
           const index = opponentDuels.indexOf(duel);
           if (index > -1)
           {
            opponentDuels.splice(index, 1);
           }
        }
    }
}
