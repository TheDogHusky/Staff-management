import Client from "./client";
import { IActivityCheck } from "../utils";
import {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ButtonStyle,
    ButtonInteraction,
    TextBasedChannel
} from "discord.js";

export default class ActivityCheckManager {
    public client: Client;
    public checks: IActivityCheck[] = [];

    public constructor(client: Client) {
        this.client = client;

        this.client.on('interactionCreate', async (interaction) => {
            if (interaction.isButton() && interaction.inCachedGuild()) {
                await this.handleInteraction(interaction).catch((err) => {
                    this.client.logger.error("Something wrong happened while the activity check.", 'Activity Check Manager');
                    this.client.logger.error(err.stack, 'Activity Check Manager');
                });
            }
        });
    }

    public async fetchChecks(): Promise<void> {
        const guilds = await this.client.database.getGuilds();
        for (const guild of guilds) {
            if (guild.isCheckEnabled) {
                let interval = Date.now() - guild.lastCheck;
                if (interval > guild.checkInterval) interval = guild.checkInterval - 1;
                const timeout = setTimeout(() => {
                    this.checkActivity(guild._id);
                }, guild.checkInterval - interval);
                let activityTimeout: NodeJS.Timeout | undefined;
                if (Date.now() - guild.lastCheck > guild.checkTimeout) await this.handleTimeout(guild._id).catch(() => {});
                else activityTimeout = setTimeout(() => {
                    this.handleTimeout(guild._id);
                });
                this.checks.push({ timeout, guildId: guild._id, activityTimeout });
            }
        }

        this.client.logger.info(`Fetched ${this.checks.length} activity checks.`, 'Activity Check Manager');
    }

    public async checkActivity(guildId: string): Promise<void> {
        const check = this.checks.find((check) => check.guildId === guildId);
        if (check) {
            clearTimeout(check.timeout);
            this.checks = this.checks.filter((c) => c.guildId !== guildId);
        }
        const guild = await this.client.database.getGuild(guildId);
        const guildObject = this.client.guilds.cache.get(guildId);
        if (!guildObject) return;

        const channel = guildObject.channels.cache.get(guild.checkChannel);
        if (!channel || !channel.isTextBased()) return;

        const embed = new EmbedBuilder()
            .setTitle(`${this.client.config.emotes.warning}・Staff Activity Check`)
            .setDescription(`> Please click the following button to confirm your activity.\n> If you are not active, you will be fired.`)
            .setColor(this.client.config.colors.warning)
            .setFooter({ text: `Activity Check`, iconURL: this.client.user?.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(new ButtonBuilder()
                .setCustomId('confirm_activity')
                .setLabel('Confirm Activity')
                .setStyle(ButtonStyle.Primary)
            );

        const message = await channel.send({ embeds: [embed], components: [row], content: `<@&${guild.staffRole}>` });

        guild.lastCheck = Date.now();
        await guild.save();

        const timeout = setTimeout(() => {
            this.checkActivity(guildId);
        }, guild.checkInterval);
        const activityTimeout = setTimeout(() => {
            this.handleTimeout(guildId);
        }, guild.checkTimeout);
        this.checks.push({ timeout, guildId, activityTimeout, activityCheckMessageId: message.id });
    }

    public async handleInteraction(interaction: ButtonInteraction<"cached">): Promise<void> {
        if (interaction.customId !== 'confirm_activity') return;
        const member = interaction.member;

        const guild = await this.client.database.getGuild(interaction.guildId);
        if (!guild.isCheckEnabled) return;
        if (!member.roles.cache.has(guild.staffRole)) return;
        if (Date.now() - guild.lastCheck < guild.checkTimeout) return; // If the timeout has already passed
        const channel = interaction.channel;
        if (!channel || !channel.isTextBased()) return;

        guild.activeStaff.push(member.id);
        await guild.save();

        const embed = new EmbedBuilder()
            .setTitle(`${this.client.config.emotes.success}・Activity Confirmed`)
            .setDescription(`> Your activity has been confirmed.\n> You will not be fired.`)
            .setColor(this.client.config.colors.success)
            .setFooter({ text: `Activity Check`, iconURL: this.client.user?.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], components: [], ephemeral: true });
    }

    public async handleTimeout(guildId: string): Promise<void> {
        const guild = await this.client.database.getGuild(guildId);
        if (!guild.isCheckEnabled) return;

        const guildObject = this.client.guilds.cache.get(guildId);
        if (!guildObject) return;

        const activeStaffMembers = guild.activeStaff.map((id) => guildObject.members.cache.get(id));
        const staffMembers = guildObject.members.cache.filter((member) => member.roles.cache.has(guild.staffRole));
        const inactiveStaffMembers = staffMembers.filter((member) => !activeStaffMembers.includes(member));

        for (const member of inactiveStaffMembers.values()) {
            await member.roles.remove(guild.staffRole);
            const embed = new EmbedBuilder()
                .setTitle(`${this.client.config.emotes.error}・Activity Check Failed`)
                .setDescription(`> You have been removed from the staff team due to inactivity.\n> Please address any concerns to the staff team.`)
                .setColor(this.client.config.colors.error)
                .setFooter({ text: `Activity Check`, iconURL: this.client.user?.displayAvatarURL() })
                .setTimestamp();
            await member.send({ embeds: [embed] }).catch(() => {});
        }

        const check = this.checks.find((check) => check.guildId === guildId);
        if (check) {
            clearTimeout(check.activityTimeout);
            const message = await (guildObject.channels.cache.get(guild.checkChannel) as TextBasedChannel)?.messages.fetch(check.activityCheckMessageId || '').catch(() => null);
            if (message) {
                const embed = new EmbedBuilder()
                    .setTitle(`${this.client.config.emotes.error}・Activity Check Finished`)
                    .setDescription(`> The activity check has finished.\n> ${inactiveStaffMembers.size} staff members have been removed.`)
                    .setColor(this.client.config.colors.success)
                    .setFooter({ text: `Activity Check`, iconURL: this.client.user?.displayAvatarURL() })
                    .setTimestamp();
                console.log(message)
                await message.edit({ embeds: [embed], components: [] }).catch(() => {});
            }
        }
    }

    public stopCheck(guildId: string): void {
        const check = this.checks.find((check) => check.guildId === guildId);
        if (check) {
            clearTimeout(check.timeout);
            if (check.activityTimeout) clearTimeout(check.activityTimeout);
            this.checks = this.checks.filter((c) => c.guildId !== guildId);
        }
    }

    public stopAllChecks(): void {
        for (const check of this.checks) {
            clearTimeout(check.timeout);
            if (check.activityTimeout) clearTimeout(check.activityTimeout);
        }
        this.checks = [];
    }

    public async resetCheck(guildId: string): Promise<void> {
        this.stopCheck(guildId);
        await this.fetchChecks();
    }
}