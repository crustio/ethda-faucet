import {GatewayIntentBits} from "discord.js";
import {disconnect, initDb} from "./db";
import {stop, listenMessageJob, indexAllMessage, indexHistoryMessageJob} from "./discord";
import {stopJob, transferJob} from "./chain";
const schedule = require('node-schedule');

async function start() {
    await initDb();
    return Promise.all([indexAllMessage(), listenMessageJob(), transferJob()])
}

async function gracefulShutdown(signal: string) {
    console.debug(`Received ${signal}. Shutting down...`);
    await stop();
    stopJob();
    await disconnect();
}

start().catch(e => {
    console.error(e);
});

schedule.scheduleJob('0 0 * * * *', async () => {
    console.log('start...');
    await indexHistoryMessageJob();
});

// Listen for TERM signal .e.g. kill
process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));

// Listen for INT signal e.g. Ctrl-C
process.on("SIGINT", () => void gracefulShutdown("SIGINT"));


