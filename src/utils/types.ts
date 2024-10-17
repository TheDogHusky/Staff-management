import {APIApplicationCommandOption, ColorResolvable, PermissionResolvable} from 'discord.js';
import { Document } from 'mongoose';

export type CommandOptions = APIApplicationCommandOption[] | undefined[] | Array<any>;

export interface IInfos {
    name: string;
    description: string;
    category: string;
    usage: string;
    options: CommandOptions;
    permissions: PermissionResolvable[];
    defer: boolean;
}

export interface IEventInfos {
    name: string;
    once: boolean;
}

export interface IGuild extends Document {
    _id: string;
    isCheckEnabled: boolean;
    checkChannel: string;
    staffRole: string;
    checkInterval: number;
    checkTimeout: number;
    lastCheck: number;
    activeStaff: string[];
}

export interface Colors {
    main: ColorResolvable;
    error: ColorResolvable;
    success: ColorResolvable;
    bug: ColorResolvable;
    warning: ColorResolvable;
    info: ColorResolvable;
    loading: ColorResolvable;
    debug: ColorResolvable;
    secondary: ColorResolvable;
}

export interface IActivityCheck {
    timeout: NodeJS.Timeout;
    activityTimeout?: NodeJS.Timeout;
    guildId: string;
    activityCheckMessageId?: string;
}