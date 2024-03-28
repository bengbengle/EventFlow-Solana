import { Connection, Ed25519Keypair, Keypair, PublicKey } from "@solana/web3.js";
//@ts-expect-error missing types
import * as BufferLayout from "buffer-layout";

import * as fs from "fs";

export const logError = (msg: string) => {
  console.log(`\x1b[31m${msg}\x1b[0m`);
};

export const writePublicKey = (publicKey: PublicKey, name: string) => {
  fs.writeFileSync(`./keys/${name}_pub.json`, JSON.stringify(publicKey.toString()));
};

export const getPublicKey = (name: string) => {

    if(name == 'admin')
    {
      return getAdminKeypair("admin").publicKey;

    } else {

      const content = fs.readFileSync(`./keys/${name}_pub.json`) as unknown as string
      const value = JSON.parse(content);
      return new PublicKey(value);
    }
  }

export const getPrivateKey = (name: string) => {
  
  if(name == 'admin') {
    const privateKey = Uint8Array.from(
      JSON.parse(fs.readFileSync(`/home/codespace/.config/solana/id.json`) as unknown as string)
    );
    return privateKey;
  }
  
  return Uint8Array.from(
    JSON.parse(fs.readFileSync(`./keys/${name}.json`) as unknown as string)
  );
}
  

export const getKeypair = (name: string) =>{

  const pair = new Keypair({
    publicKey: getPublicKey(name).toBytes(),
    secretKey: getPrivateKey(name),
  });
  return pair;
}

export const getAdminKeypair = (name: string) =>{


  const privateKey = Uint8Array.from(
    JSON.parse(fs.readFileSync(`/home/codespace/.config/solana/id.json`) as unknown as string)
  );

  const pair =  Keypair.fromSecretKey(privateKey);

  console.log(pair.publicKey);

  return pair;
}
 

export const getProgramId = () => {
  try {
    return getPublicKey("program");
  } catch (e) {
    // logError("Given programId is missing or incorrect");
    process.exit(1);
  }
};

export const getTerms = (): {
  aliceExpectedAmount: number; 
  bobExpectedAmount: number;
  sellX: number;
  buyY: number;
} => {
  return JSON.parse(fs.readFileSync(`./terms.json`) as unknown as string);
};

export const getTokenBalance = async (
  pubkey: PublicKey,
  connection: Connection
) => {
  return parseInt(
    (await connection.getTokenAccountBalance(pubkey)).value.amount
  );
};

/**
 * Layout for a public key
 */
const publicKey = (property = "publicKey") => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
const uint64 = (property = "uint64") => {
  return BufferLayout.blob(8, property);
};

export interface QuestState {
  isInitialized: number;                              // 是否初始化 
  publisherPubkey: Uint8Array;                        // 
  questAtaPubkey: Uint8Array;                         // 发布者的 USDT 代币账户 地址
}

export const QuestAccountLayout = BufferLayout.struct([
  BufferLayout.u8("isInitialized"),
  publicKey("publisherPubkey"),
  publicKey("questAtaPubkey"),
]);

