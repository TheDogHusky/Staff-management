import Command from '../../structs/command';
import Client from '../../structs/client';
import { ChatInputCommandInteraction, ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { IGuild, formatCommand } from '../../utils';

export default class HelpCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'help',
            description: 'Get help about a command or general help',
            category: 'utils',
            usage: 'help [command]',
            permissions: [],
            options: [
                {
                    name: 'command',
                    description: 'The command you want to get help from',
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ],
            defer: true
        });
    };

    public async run(client: Client, ctx: ChatInputCommandInteraction<"cached">, data: IGuild): Promise<void> {
        const command = ctx.options.getString('command');
        if (command) {
            const cmd = client.commands.get(command);
            if (!cmd) {
                await ctx.editReply({
                    content: `The command \`${command}\` doesn't exist.`
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`${client.config.emotes.info}・Help for ${cmd.name}`)
                .setDescription(`> ${cmd.description.split('\n').join('\n> ')}\n\n> **Usage**: \`${cmd.usage}\`\n> **Category**: \`${cmd.category}\`\n> **Permissions required**: \`${cmd.permissions.length ? cmd.permissions.map((perm) => `\`${perm}\``).join(', ') : 'none'}\``)
                .setColor(client.config.colors.main)
                .setTimestamp()
                .setAuthor({ name: ctx.user.tag, iconURL: ctx.user.displayAvatarURL({ size: 1024, extension: 'webp' }) })
                .setFooter({ text: `Requested by ${ctx.user.tag}`, iconURL: client.user?.displayAvatarURL({ size: 1024, extension: 'webp' }) });

            await ctx.editReply({
                embeds: [embed]
            });
        } else {
            const utils = client.commands.filter((cmd) => cmd.category === 'utils')?.map((cmd) => formatCommand(client)(cmd.name)).join(', ') || '*Coming soon!*';
            const config = client.commands.filter((cmd) => cmd.category === 'config')?.map((cmd) => formatCommand(client)(cmd.name)).join(', ') || '*Coming soon!*';

            const embed = new EmbedBuilder()
                .setTitle(`${client.config.emotes.info}・Help`)
                .setDescription(`> To get help about a specific command, run \`/help <command>\`.\n> To execute a command, run \`/command\`.`)
                .addFields([
                    {
                        name: `${client.config.emotes.utils}・Utils`,
                        value: `> ${utils}`,
                        inline: true
                    },
                    {
                        name: `${client.config.emotes.gear}・Configuration`,
                        value: `> ${config}`,
                        inline: true
                    }
                ])
                .setColor(client.config.colors.main)
                .setTimestamp()
                .setAuthor({ name: ctx.user.tag, iconURL: ctx.user.displayAvatarURL({ size: 1024, extension: 'webp' }) })
                .setFooter({ text: `Requested by ${ctx.user.tag}`, iconURL: client.user?.displayAvatarURL({ size: 1024, extension: 'webp' }) });

            await ctx.editReply({
                embeds: [embed]
            });
        }
    };
};