import {isAddress} from "ethers";
import {env} from "../env";

export function getEnv(value: string, defaultValue: string = ''): string {
  return process.env[value]?? defaultValue;
}

export function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function parseAccount(content: string): string | null {
  const faucetMark = `<@${env.callUserId}>`;
  if (content.startsWith(faucetMark)) {
    const account = content.replace(faucetMark, '').replace(' ', '');
    return isAddress(account) ? account : null;
  }
  return null;
}
