import Client from './client';
import { IEventInfos } from '../utils';

export default abstract class Event {
    public name: string;
    public client: Client;
    public once: boolean;

    public constructor(client: Client, opts: IEventInfos) {
        this.client = client;
        this.name = opts.name;
        this.once = opts.once;
    };

    public abstract run(client: Client, ...args: any[]): Promise<void>;
};