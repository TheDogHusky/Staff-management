import Command from '../../structs/command';
import Client from '../../structs/client';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { IGuild } from '../../utils';

export default class SetStaffRoleCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'setsstaffrole',
            description: 'Sets the activity check role to check activity from',
            category: 'config',
            usage: 'setstaffrole <channel>',
            options: [
                {
                    name: 'role',
                    description: 'The role to set as the staff role',
                    type: ApplicationCommandOptionType.Role,
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
        const role = ctx.options.getRole('role', true);

        data.staffRole = role.id;
        await data.save();

        await ctx.editReply({
            content: client.makeReply(`The staff role has been set to <@&${role.id}>.`, "success")
        });
    };
};