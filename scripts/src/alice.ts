import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

import {
  // QuestState,
  QuestAccountLayout,
  QuestState,
  getKeypair,
  getProgramId,
  getPublicKey,
  getTokenBalance,
  logError,
  writePublicKey,
} from "./utils";

import BN = require("bn.js");

const alice = async () => {

  
  // AaRb7qqaJUFiimn3DSHSHnVxBvpZ5GuxUGbJYXRZSriW testnet
  // AaRb7qqaJUFiimn3DSHSHnVxBvpZ5GuxUGbJYXRZSriW devnet
  const questProgramId = getProgramId();
  
  const alice_Keypair = getKeypair("alice");
  const alicePubKey = alice_Keypair.publicKey;
  
  const quest_Keypair = new Keypair();
  const quest_pubkey = quest_Keypair.publicKey
  
  const quest_ata_KeyPair = new Keypair();
  const quest_ata_pubkey = quest_ata_KeyPair.publicKey;

  const ata_alice_Pubkey = getPublicKey("ata_alice");
  
  const USDT = getPublicKey("USDT");
  
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const space = AccountLayout.span;
  const lamports = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  // create quest ata usdt account
  const createAccountIx = SystemProgram.createAccount({
    programId: TOKEN_PROGRAM_ID,
    space: space,
    lamports: lamports,                         
    fromPubkey: alicePubKey,            
    newAccountPubkey: quest_ata_pubkey,
  });

  // init quest ata usdt account
  const createInitAccountIx = Token.createInitAccountInstruction(
    TOKEN_PROGRAM_ID,   
    USDT,                       // mint key
    quest_ata_pubkey,           // account
    alicePubKey                 // owner
  );

  
  // transfer 8 usdt to quest_ata_pubkey
  const transferTokenIx = Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    ata_alice_Pubkey,                 // source
    quest_ata_pubkey,                 // destination
    alicePubKey,                      // owner
    [],                               // multiSigners
    8                                 // amount
  );
  

  const _space = QuestAccountLayout.span;
  const _lamports = await connection.getMinimumBalanceForRentExemption(QuestAccountLayout.span);

  // create quest account 
  const createQuestAccountIx = SystemProgram.createAccount({
    programId: questProgramId,                 
    space: _space,     
    lamports: _lamports,
    fromPubkey: alicePubKey,                    
    newAccountPubkey: quest_pubkey,             
  });

  const createQuestIx = new TransactionInstruction({
    programId: questProgramId,
    keys: [
      { pubkey: alicePubKey, isSigner: true, isWritable: false },                       // 第 1 账户, sender key
      { pubkey: quest_ata_pubkey, isSigner: false, isWritable: true },                  // 第 2 账户, alice quest_ata_pubkey
      { pubkey: quest_pubkey, isSigner: false, isWritable: true },                      // 第 3 账户  alice quest pubkey
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },               // 第 4 账户  rent account
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },                 // 第 5 账户  token program id 
    ],
    data: Buffer.from(Uint8Array.of(0, ...new BN("2").toArray("le", 8))),              // [0, amount=10]
  });

  const _transaction = new Transaction().add(
    createAccountIx,

    createInitAccountIx,
    transferTokenIx,

    createQuestAccountIx,
    createQuestIx
  );
  
  // console.log("Sending Alice's transaction...");

  await connection.sendTransaction(
    _transaction,
    [ 
      alice_Keypair,
      quest_ata_KeyPair,
      quest_Keypair
    ],
    {
      skipPreflight: false, 
      preflightCommitment: "confirmed"
    }
  );

  // sleep to allow time to update
  await new Promise((resolve) => setTimeout(resolve, 1000));
 

  console.log(`Quest successfully cleated. Alice is offering 10 X✨\n`);
  
  writePublicKey(quest_pubkey, "quest");

  const questAccount = await connection.getAccountInfo(quest_Keypair.publicKey);
  const _decodedQuest = QuestAccountLayout.decode(questAccount!.data) as QuestState;
  
  const ata_quest_pubkey = new PublicKey(_decodedQuest.questAtaPubkey);
  writePublicKey(ata_quest_pubkey, "ata_quest");

  console.table([
    {
      "Alice USDT Token Account ": await getTokenBalance(getPublicKey("ata_alice"), connection),
      "Bob USDT Token Account": await getTokenBalance(getPublicKey("ata_bob"), connection),
      "USDT Token Account": await getTokenBalance(quest_ata_KeyPair.publicKey, connection),
      "Quest USDT": await getTokenBalance(ata_quest_pubkey, connection),
    },
  ]);

  console.log("");
};

alice();
