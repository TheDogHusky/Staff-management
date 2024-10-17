import Command from '../../structs/command';
import Client from '../../structs/client';
import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { IGuild } from '../../utils';
import ms from 'ms';

export default class ActivityCheckStatusCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'status',
            description: 'Gets an overview of the current activity check status',
            category: 'config',
            usage: 'setstaffrole <channel>',
            options: [],
            permissions: [
                PermissionFlagsBits.ManageGuild
            ],
            defer: true
        });
    };

    public async run(client: Client, ctx: ChatInputCommandInteraction<"cached">, data: IGuild): Promise<void> {
        const role = data.staffRole ? `<@&${data.staffRole}>` : '\`none\`';
        const interval = data.checkInterval ? ms(data.checkInterval) : '\`none\`';
        const timeout = data.checkTimeout ? ms(data.checkTimeout) : '\`none\`';
        const channel = data.checkChannel ? `<#${data.checkChannel}>` : '\`none\`';
        const enabled = data.isCheckEnabled ? '\`enabled\`' : '\`disabled\`';
        const lastCheck = data.lastCheck ? new Date(data.lastCheck).toLocaleString() : '\`none\`';

        const embed = new EmbedBuilder()
            .setTitle(`${client.config.emotes.status}・Overview`)
            .setDescription(`> Here is an overview of the current activity check status.`)
            .setColor(client.config.colors.main)
            .setAuthor({ name: ctx.user.tag, iconURL: ctx.user.displayAvatarURL({ size: 1024, extension: 'webp' }) })
            .setFooter({ text: `Requested by ${ctx.user.tag}`, iconURL: client.user?.displayAvatarURL({ size: 1024, extension: 'webp' }) })
            .addFields([
                {
                    name: `${client.config.emotes.hashtag}・Check channel`,
                    value: `> ${channel}`,
                    inline: true
                },
                {
                    name: `${client.config.emotes.clock}・Check interval`,
                    value: `> ${interval}`,
                    inline: true
                },
                {
                    name: `${client.config.emotes.time}・Check timeout`,
                    value: `> ${timeout}`,
                    inline: true
                },
                {
                    name: `${client.config.emotes.at}・Staff role`,
                    value: `> ${role}`,
                    inline: true
                },
                {
                    name: `${client.config.emotes.status}・Check status`,
                    value: `> ${enabled}`,
                    inline: true
                },
                {
                    name: `${client.config.emotes.time}・Last check`,
                    value: `> ${lastCheck}`,
                    inline: true
                }
            ])
            .setTimestamp();

        await ctx.editReply({
            embeds: [embed]
        });
    };
};