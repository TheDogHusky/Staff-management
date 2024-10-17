import Command from '../../structs/command';
import Client from '../../structs/client';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { IGuild, isValidTime, confirm } from '../../utils';
import ms from 'ms';

export default class DisableCheckCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'setchecktimeout',
            description: 'Sets the time after the deadline has been reached to take actions over a staff member',
            category: 'config',
            usage: 'setchecktimeout <time>',
            options: [
                {
                    name: 'time',
                    description: 'The time to set the check timeout to',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ],
            permissions: [
                PermissionFlagsBits.ManageGuild
            ],
            defer: true
        });
    };

    public async run(client: Client, ctx: ChatInputCommandInteraction<"cached">, data: IGuild): Promise<void> {
        const time = ctx.options.getString('time', true);

        if (!isValidTime(time)) {
            await ctx.editReply({
                content: client.makeReply('Invalid time format.', 'error')
            });
            return;
        }

        if (!await confirm(client.makeReply(`Are you sure you want to set the check timeout to ${time}? This will also reset the current activity check to set a new one with the new timeout.`, 'warning'), ctx)) return;

        data.checkTimeout = ms(time);
        await data.save();

        await client.acm.resetCheck(data._id);

        await ctx.editReply({
            content: client.makeReply(`Successfully set the check timeout to ${time}`, 'success')
        });
    };
};