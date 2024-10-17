import { Client as DiscordClient, GatewayIntentBits, Collection } from 'discord.js';
import { Logger } from '@classycrafter/super-logger';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import Command from './command';
import Event from './event';
import Database from './database';
import { config } from 'dotenv';
import * as conf from '../config';
import ActivityCheckManager from "./activityCheck";

config();

export default class Client extends DiscordClient {
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public logger: Logger = new Logger({
        name: 'Nekonyan',
        writelogs: true,
        colored: true,
        dirpath: join(__dirname, '..', '..', 'logs'),
        tzformat: 24,
        timezone: 'Europe/Paris'
    });
    public database: Database = new Database(this);
    public config: typeof conf = conf;
    public acm: ActivityCheckManager = new ActivityCheckManager(this);

    public constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
            ]
        });
    };

    public async loadEvents(): Promise<void> {
        const eventPath = join(__dirname, '..', 'events');
        const events = readdirSync(`${eventPath}`).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

        for (const file of events) {
            const { default: Event } = await this.import(`${eventPath}/${file}`);
            const event = new Event(this);

            this.events.set(event.name, event);
            if (event.once) this.once(event.name, (...args) => event.run(this, ...args));
            else this.on(event.name, (...args) => event.run(this, ...args));
        }
    }

    makeReply(content: string, type: typeof this.config.emotes | string): string {
        // @ts-ignore
        return `${this.config.emotes[type]}・${content}`;
    }

    async synchronizeCommands(): Promise<void> {
        const commands = this.commands.map((command) => command.getPostableData());
        const devGuild = await this.guilds.fetch(this.config.devGuildId);
        if (process.env.NODE_ENV === 'development') {
            await this.application?.commands.set([]);
            await devGuild.commands.set(commands);
            return;
        } else {
            await devGuild.commands.set([]);
        }
        await this.application?.commands.set(commands);
        this.logger.info(`Commands have been synchronized!`, 'Commands');
        return;
    }

    private async _init(): Promise<void> {
        await this.database.connect();

        await this.loadCommands();
        await this.loadEvents();
    };

    public async start(): Promise<void> {
        this.logger.info(`Starting ${process.env.npm_package_name} on ${process.env.NODE_ENV} mode...`, 'Startup');
        await this._init();
        await this.login(process.env.TOKEN);
    };

    public async stop(): Promise<void> {
        await this.destroy();
        await this.database.disconnect();
    };

    public async loadCommands(): Promise<void> {
        const commandPath = join(__dirname, '..', 'commands');

        for (const dir of readdirSync(commandPath)) {
            const commands = readdirSync(`${commandPath}/${dir}`).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

            for (const file of commands) {
                const { default: Command } = await this.import(`${commandPath}/${dir}/${file}`);
                const command = new Command(this);

                this.commands.set(command.name, command);
            }
        }
    }

    public async import(path: string): Promise<any> {
        if (process.platform === 'win32') {
            path = `file://${path}`;
        }
        return await import(path);
    }
}