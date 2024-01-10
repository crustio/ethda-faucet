import {Client, GatewayIntentBits} from "discord.js";
import {parseAccount} from "../util/common";
import {Message, MessageState} from "../db";
import {env} from "../env";

const client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ] });

export async function listenMessage() {
    console.log('start listen message...');
    client.on('ready', async () => {
        console.log(`connect successful...`);
    });
    client.on('messageCreate', async (message) => {
        if (message.channelId === env.channelId) {
            const account = parseAccount(message.content);
            if (account) {
                await Message.create({
                    authorId: message.author.id,
                    message: message.content,
                    account,
                    state: MessageState.CREATE
                }, {
                    ignoreDuplicates: true
                })
            } else if (account === undefined) {
                console.log(`invalid faucet message: ${message.content}`);
            }
        }
    });
    await client.login(env.token);
}


export async function destroy() {
    client.destroy().finally(() => {
        console.debug("discord client shut down");
    });
}
