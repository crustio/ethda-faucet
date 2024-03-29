import {getEnv} from "./util/common";

export const env = {
    rpcUrl: getEnv('RPC_URL', 'https://rpc-devnet.ethda.io'),
    transferValue: getEnv('VALUE', '0.1'),
    secretKey: getEnv('SECRET_KEY'),
    indexHistory: getEnv('HISTORY_INDEX', 'true'),
    dbPath: getEnv('DB_PATH', '/app'),
    channelId: getEnv('CHANNEL_ID', '1192017639493603369'),
    token: getEnv('TOKEN', ''),
    blockScanUrl: getEnv('BLOCK_SCAN_URL', 'https://scan-devnet.ethda.io'),
    callUserId: getEnv('FAUCET_CALL_USER_ID', '1193830903496065024'),
    env: getEnv('ENV', 'dev')
}
