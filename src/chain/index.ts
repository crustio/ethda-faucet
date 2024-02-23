import {ethers, parseUnits, Wallet} from "ethers";
import * as _ from "lodash";
import {env} from "../env";
import {sleep} from "../util/common";
import {Message} from "discord.js";
import {MessageModel, MessageState} from "../model/message";
import {getChannel, sendReplyMessage} from "../discord";
const PROVIDER = new ethers.JsonRpcProvider(env.rpcUrl);
const DEFAULT_VALUE = env.transferValue;

let startTransfer = true;

export interface TransferResult {
    txHash: string,
    blockNumber: number
}

async function transfer(address: string, value: string = DEFAULT_VALUE): Promise<TransferResult | null> {
    const signer = new Wallet(env.secretKey, PROVIDER);
    const tx = await signer.sendTransaction({
        to: address,
        value: parseUnits(value, 'ether')
    });
    console.log(`transfer to ${address} value: ${value}...`);
    await sleep(1000 * 2);
    const txData = await tx.getTransaction();
    if (txData == null) {
        return null
    } else {
        console.log(`transaction: ${JSON.stringify(txData)}`)
        return {
            txHash: txData.hash,
            blockNumber: txData.blockNumber
        }
    }

}

export async function transferJob() {
    while (startTransfer) {
        try {
            const messages = await MessageModel.findAll({
                where: {
                    state: MessageState.CREATE,
                },
                limit: 100,
                order: [
                    ['id', 'ASC']
                ]
            });
            if (!_.isEmpty(messages)) {
                for (const m of messages) {
                    console.log(`transfer to account: ${m.getDataValue('account')} value: ${DEFAULT_VALUE}`)
                    const r = await transfer(m.getDataValue('account'), DEFAULT_VALUE);
                    if (r == null) {
                        await MessageModel.update(
                            {
                                state: MessageState.ERROR,
                            }, {
                                where: {
                                    id: m.getDataValue('id')
                                }
                            })
                        continue;
                    }
                    const txHash = r.txHash;
                    const messageId = m.getDataValue('messageId');
                    if (messageId) {
                        await sendReplyMessage(txHash, messageId);
                    }
                    await MessageModel.update(
                        {
                            state: MessageState.TRANSFERRED,
                            value: DEFAULT_VALUE,
                            txHash: r.txHash,
                            blockNumber: r.blockNumber
                        }, {
                            where: {
                                id: m.getDataValue('id')
                            }
                        })
                }
            }
        } catch (e) {
            console.log(`transfer error...`);
            console.error(e);
            await sleep(10 * 1000);
        } finally {
            await sleep(1 * 1000);
        }
    }
}

export function stopJob() {
    startTransfer = false;
}
