import {GatewayIntentBits} from "discord.js";
import {disconnect, initDb} from "./db";
import {destroy, listenMessage} from "./discord";
import {stopJob, transferJob} from "./chain";

async function start() {
    await initDb();
    return Promise.all([listenMessage(), transferJob()])
}

async function gracefulShutdown(signal: string) {
    console.debug(`Received ${signal}. Shutting down...`);
    await destroy();
    stopJob();
    await disconnect();
}

start().catch(e => {
    console.error(e);
});

// Listen for TERM signal .e.g. kill
process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));

// Listen for INT signal e.g. Ctrl-C
process.on("SIGINT", () => void gracefulShutdown("SIGINT"));


