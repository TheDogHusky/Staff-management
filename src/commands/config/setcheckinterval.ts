import Command from '../../structs/command';
import Client from '../../structs/client';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { IGuild, isValidTime, confirm } from '../../utils';
import ms from 'ms';

export default class DisableCheckCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'setcheckinterval',
            description: 'Sets the time between each check',
            category: 'config',
            usage: 'setcheckinterval <time>',
            options: [
                {
                    name: 'time',
                    description: 'The time to set the check the interval to (eg: 1mo, 1d, etc..)',
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

        if (!await confirm(client.makeReply(`Are you sure you want to set the check interval to ${time}? This will also reset the current activity check to set a new one with the new interval.`, 'warning'), ctx)) return;

        data.checkInterval = ms(time);
        await data.save();

        await client.acm.resetCheck(data._id);


        await ctx.editReply({
            content: client.makeReply(`Successfully set the check interval to ${time}`, 'success')
        });
    };
};