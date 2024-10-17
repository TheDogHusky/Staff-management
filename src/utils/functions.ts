import ms from 'ms';
import Client from '../structs/client';
import {
    ActionRowBuilder,
    ApplicationCommand,
    ApplicationCommandResolvable,
    ButtonBuilder, ButtonStyle, ChatInputCommandInteraction
} from 'discord.js';

export function wait(time: number | string): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, typeof time === 'string' ? ms(time) : time);
    });
}

export function formatUptime(ms: number): string {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor(ms / 3600000) % 24;
    const minutes = Math.floor(ms / 60000) % 60;
    const seconds = Math.floor(ms / 1000) % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export function getCommand(name: string, client: Client): ApplicationCommandResolvable | undefined {
    if (process.env.NODE_ENV === 'development') {
        const guild = client.guilds.cache.get(client.config.devGuildId);
        return guild?.commands.cache.find((command) => command.name === name);
    }
    else return client.application?.commands.cache.find((command) => command.name === name);
}

export function formatCommand(client: Client) {
    return (command: string): string => {
        const resolvable = getCommand(command, client);
        if (resolvable instanceof ApplicationCommand) return `</${command}:${resolvable.id}>`;
        else if (resolvable) return `</${command}:${resolvable}>`;
        else return `\`${command}\``;
    }
}

export function isValidTime(time: string): boolean {
    try {
        ms(time);
        return true;
    } catch {
        return false;
    }
}

export async function confirm(message: string, ctx: ChatInputCommandInteraction<"cached">): Promise<boolean> {
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success)
        )
        .addComponents(new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
        );

    if (ctx.deferred) await ctx.editReply({
        content: message,
        components: [row]
    });
    else await ctx.reply({
        content: message,
        components: [row],
        ephemeral: true
    });

    const filter = (interaction: any) => interaction.customId === 'confirm' || interaction.customId === 'cancel';
    const interaction = await ctx.channel?.awaitMessageComponent({ filter, time: 15000 });
    if (interaction && interaction.customId === 'confirm') {
        await interaction.deferUpdate();
        return true;
    }
    else return false;
}