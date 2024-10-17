import Command from '../../structs/command';
import Client from '../../structs/client';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { IGuild } from '../../utils';

export default class SetCheckChannelCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'setcheckchannel',
            description: 'Sets the activity check channel to sent the check to',
            category: 'config',
            usage: 'setcheckchannel <channel>',
            options: [
                {
                    name: 'channel',
                    description: 'The channel to set as the check channel',
                    type: ApplicationCommandOptionType.Channel,
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
        const channel = ctx.options.getChannel('channel', true);
        if (!channel.isTextBased()) {
            await ctx.editReply({
                content: client.makeReply("The channel you provided is invalid.", "error")
            });
            return;
        }

        data.checkChannel = channel.id;
        await data.save();

        await ctx.editReply({
            content: client.makeReply(`The check channel has been set to <#${channel.id}>.`, "success")
        });
    };
};