import Event from '../structs/event';
import Client from '../structs/client';
import { ChatInputCommandInteraction } from 'discord.js';

export default class InteractionCreateEvent extends Event {
    public constructor(client: Client) {
        super(client, {
            name: 'interactionCreate',
            once: false
        });
    };

    public async run(client: Client, ctx: ChatInputCommandInteraction): Promise<void> {
        if (!ctx.isCommand()) return;
        if (!ctx.inGuild() || !ctx.guild) return;
        if (!ctx.inCachedGuild()) return;
        if (!client.isReady()) return;
        if (!ctx.channel) return;
        if (!ctx.channel.isTextBased()) return;
        if (ctx.channel.isDMBased()) return;

        const data = await client.database.getGuild(ctx.guild.id);
        const command = client.commands.get(ctx.commandName);
        if (!command) {
            await ctx.reply({
                content: client.makeReply("That command does not exist.", "error"),
                ephemeral: true
            });
            try {
                await client.application.commands.delete(ctx.commandId);
            } catch(e) {
                await ctx.guild.commands.delete(ctx.commandId).catch(() => {
                    return;
                });
            }
            return;
        }

        if (command.permissions.length) {
            const missingPermissions = command.permissions.filter((permission) => !ctx.member.permissions.has(permission));
            if (missingPermissions.length) {
                await ctx.reply({
                    content: client.makeReply(`You are missing the following permissions to execute this command: \`${missingPermissions.map(perm => `\`${perm}\``).join(', ')}\``, "error"),
                    ephemeral: true
                });
                return;
            }
        }

        if (command.defer) {
            await ctx.deferReply();
        }

        try {
            await command.run(client, ctx, data);
        } catch(e) {
            await command.onError(ctx, e as Error);
        }
    };
};