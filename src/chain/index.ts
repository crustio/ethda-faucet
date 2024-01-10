import {ethers, parseUnits, Wallet} from "ethers";
import {Message, MessageState} from "../db";
import * as _ from "lodash";
import {env} from "../env";
import {sleep} from "../util/common";
const PROVIDER = new ethers.JsonRpcProvider(env.rpcUrl);
const DEFAULT_VALUE = env.transferValue;

let startTransfer = true;

export interface TransferResult {
    txHash: string,
    blockNumber: number
}

async function transfer(address: string, value: string = DEFAULT_VALUE): Promise<TransferResult> {
    const signer = new Wallet(env.secretKey, PROVIDER);
    const tx = await signer.sendTransaction({
        to: address,
        value: parseUnits(value, 'ether')
    });
    console.log(`transfer to ${address} value: ${value}...`);
    const txData = await tx.getTransaction();
    return {
        txHash: txData.hash,
        blockNumber: txData.blockNumber
    }
}

export async function transferJob() {
    while (startTransfer) {
        try {
            const messages = await Message.findAll({
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
                    const r = await transfer(m.getDataValue('account'), DEFAULT_VALUE);
                    await Message.update(
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