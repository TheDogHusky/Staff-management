import Command from '../../structs/command';
import Client from '../../structs/client';
import { ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { IGuild } from '../../utils';

export default class EnableCheckCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'enablecheck',
            description: 'Enable the check system',
            category: 'config',
            usage: 'enablecheck',
            options: [],
            permissions: [
                PermissionFlagsBits.ManageGuild
            ],
            defer: true
        });
    };

    public async run(client: Client, ctx: ChatInputCommandInteraction<"cached">, data: IGuild): Promise<void> {
        if (data.isCheckEnabled) {
            await ctx.editReply({
                content: client.makeReply("The check system is already enabled.", "error")
            });
            return;
        }

        data.isCheckEnabled = true;
        await data.save();

        await ctx.editReply({
            content: client.makeReply("The check system has been enabled.", "success")
        });
    };
};