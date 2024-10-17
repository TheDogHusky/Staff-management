import Command from '../../structs/command';
import Client from '../../structs/client';
import { ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { IGuild } from '../../utils';

export default class DisableCheckCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'disablecheck',
            description: 'Disable the check system',
            category: 'config',
            usage: 'disablecheck',
            options: [],
            permissions: [
                PermissionFlagsBits.ManageGuild
            ],
            defer: true
        });
    };

    public async run(client: Client, ctx: ChatInputCommandInteraction<"cached">, data: IGuild): Promise<void> {
        if (!data.isCheckEnabled) {
            await ctx.editReply({
                content: client.makeReply("The check system is already disabled.", "error")
            });
            return;
        }

        data.isCheckEnabled = false;
        await data.save();

        await ctx.editReply({
            content: client.makeReply("The check system has been disabled.", "success")
        });
    };
};