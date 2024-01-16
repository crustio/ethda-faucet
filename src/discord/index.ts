import {Client, GatewayIntentBits} from "discord.js";
import {parseAccount, sleep} from "../util/common";
import {env} from "../env";
import * as _ from "lodash";
import {MessageModel, MessageState} from "../model/message";
import {getConfig, upsertConfig} from "../model/config";
let indexHistoryStart = true;
const lastIndexKey = "LAST_INDEX_MESSAGE_ID";
const indexAllKey = "INDEX_ALL_SUCCESS";
let ready = false;

const client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
    ]});

export async function listenMessageJob() {
    console.log('start listen message...');
    client.on('ready', async () => {
        console.log(`connect successful...`);
        ready = true;
    });
    client.on('messageCreate', async (message) => {
        if (message.channelId === env.channelId) {
            const account = parseAccount(message.content);
            if (account) {
                console.log(`create author: ${message.author.id} account: ${account}`);
                await MessageModel.create({
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

export async function indexHistoryMessageJob() {
    await waitClientReady();
    const indexAllStart: any = await getConfig(indexAllKey);
    // start after all history message index success
    if (indexAllStart && indexAllStart === 'true') {
        const channel: any = client.channels.cache.get(env.channelId);
        let lastMessageId = await getConfig(lastIndexKey);
        let args = lastMessageId ? { limit: 100, after: lastMessageId } : { limit: 100 };
        let messages = await channel.messages.fetch(args);
        while(!_.isEmpty(messages)) {
            lastMessageId = messages.at(0).id;
            for (let i = 0; i < messages.size; i++) {
                const message = messages.at(i);
                const account = parseAccount(message.content);
                if (account) {
                    console.log(`create author: ${message.author.id} account: ${account} by history cronjob`);
                    await MessageModel.create({
                        authorId: message.author.id,
                        message: message.content,
                        account,
                        state: MessageState.CREATE
                    }, {
                        ignoreDuplicates: true
                    })
                }
            }
            await upsertConfig(lastIndexKey, lastMessageId);
            args = { limit: 100, after: lastMessageId };
            messages = await channel.messages.fetch(args);
        }
    }

}

async function waitClientReady() {
    while (!ready) {
        await sleep(1000);
    }
}

export async function indexAllMessage() {
    await waitClientReady();
    const indexAllStart = await getConfig(indexAllKey);
    if (indexAllStart && indexAllStart === 'true') {
        return;
    } else {
        let lastMessageId = null;
        const channel: any = client.channels.cache.get(env.channelId);
        while (true) {
            const args: any = lastMessageId ? { limit: 100, before: lastMessageId } : { limit: 100 };
            const messages = await channel.messages.fetch(args);
            if (_.isEmpty(messages)) {
                await upsertConfig(indexAllKey, 'true');
                return;
            } else {
                // update last index message id
                if (!lastMessageId) {
                    const m = messages.at(0);
                    await upsertConfig(lastIndexKey, m.id)
                }
                for (let i = 0; i < messages.size; i++) {
                    const message = messages.at(i);
                    const account = parseAccount(message.content);
                    if (account) {
                        console.log(`create author: ${message.author.id} account: ${account} all job`);
                        await MessageModel.create({
                            authorId: message.author.id,
                            message: message.content,
                            account,
                            state: MessageState.CREATE
                        }, {
                            ignoreDuplicates: true
                        })
                    }
                }
                lastMessageId = messages.at(messages.size - 1).id;
            }
        }
    }
}


export async function stop() {
    indexHistoryStart = false;
    client.destroy().finally(() => {
        console.debug("discord client shut down");
    });
}
