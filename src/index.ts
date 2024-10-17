import Client from './structs/client';
import { existsSync, mkdirSync } from 'node:fs';

if (!existsSync('logs')) {
    mkdirSync('logs');
}

const client = new Client();
client.start().catch((error) => {
    client.logger.fatal(error.stack, 'Client');
});

if (process.env.NODE_ENV === 'development') {
    process.on('unhandledRejection', (reason, promise) => {
        client.logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
    });
    process.on('uncaughtException', (error) => {
        client.logger.error(`Uncaught Exception: ${error}`);
    });
    process.on('warning', (warning) => {
        client.logger.warn(warning.stack || warning.message);
    });
}