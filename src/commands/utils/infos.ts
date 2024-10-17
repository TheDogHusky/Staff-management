import Command from '../../structs/command';
import Client from '../../structs/client';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { IGuild } from '../../utils';
import { formatUptime } from '../../utils';

export default class InfosCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'infos',
            description: 'Get some informations about the bot',
            category: 'utils',
            usage: 'infos',
            options: [],
            permissions: [],
            defer: true
        });
    };

    public async run(client: Client, ctx: ChatInputCommandInteraction<"cached">, data: IGuild): Promise<void> {
        const name = client.user?.tag;
        const id = client.user?.id;
        const owners = client.config.owners.map((owner: string) => {
            const user = client.users.cache.get(owner);
            return user?.tag || 'An error occurred';
        }).join(', ');
        const commands = client.commands.size;
        const uptime = formatUptime(client.uptime || 0);

        const embed = new EmbedBuilder()
            .setTitle(`${client.config.emotes.info}・Informations`)
            .setColor(client.config.colors.main)
            .setDescription(`> Hey there! I'm a Discord bot helping staff management here in Gamearoo's Community.\n> Here are some informations about me:`)
            .setTimestamp()
            .setAuthor({ name: ctx.user.tag, iconURL: ctx.user.displayAvatarURL({ size: 1024, extension: 'webp' }) })
            .setFooter({ text: `Requested by ${ctx.user.tag}`, iconURL: client.user?.displayAvatarURL({ size: 1024, extension: 'webp' }) })
            .addFields([
                {
                    name: `${client.config.emotes.pen}・Name`,
                    value: `> \`${name}\``,
                    inline: true
                },
                {
                    name: `${client.config.emotes.id}・ID`,
                    value: `> \`${id}\``,
                    inline: true
                },
                {
                    name: `${client.config.emotes.owner}・Owner(s)`,
                    value: `> \`${owners}\``,
                    inline: true
                },
                {
                    name: `${client.config.emotes.commands}・Commands`,
                    value: `> \`${commands}\``,
                    inline: true
                },
                {
                    name: `${client.config.emotes.time}・Uptime`,
                    value: `> \`${uptime}\``,
                    inline: true
                }
            ]);

        await ctx.editReply({
            embeds: [embed]
        });
    };
};