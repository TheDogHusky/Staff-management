import {
    Client,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    PermissionResolvable
} from 'discord.js';
import { IInfos, IGuild, CommandOptions } from '../utils';

export default abstract class Command {
    public name: string;
    public description: string;
    public category: string;
    public usage: string;
    public client: Client;
    public defer: boolean;
    public options: CommandOptions;
    public permissions: PermissionResolvable[];

    protected constructor(client: Client, options: IInfos) {
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.category = options.category;
        this.usage = options.usage;
        this.options = options.options;
        this.defer = options.defer;
        this.permissions = options.permissions;
    };

    public abstract run(client: Client, ctx: ChatInputCommandInteraction<"cached">, data: IGuild): Promise<void>;

    public getPostableData(): any {
        return {
            name: this.name,
            description: this.description,
            options: this.options,
            type: ApplicationCommandType.ChatInput
        };
    };

    public async onError(ctx: ChatInputCommandInteraction<"cached">, error: Error): Promise<void> {
        if (ctx.deferred || ctx.replied) {
            await ctx.editReply({
                content: `An error occured while executing this command: \`${error.message}\``
            });
        } else {
            await ctx.reply({
                content: `An error occured while executing this command: \`${error.message}\``
            });
        }
    };
};