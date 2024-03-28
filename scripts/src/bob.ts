import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import BN = require("bn.js");

import {
  QuestState,
  QuestAccountLayout,
  getKeypair,
  getProgramId,
  getPublicKey,
  getTokenBalance,
  logError,
} from "./utils";

const bob = async () => {

  const bobKeypair = getKeypair("bob");

  const ata_claimer_pubkey = getPublicKey("ata_bob");

  const questProgramId = getProgramId();

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const quest_pubkey = getPublicKey("quest");
  const questAccount = await connection.getAccountInfo(quest_pubkey);

  if (questAccount === null) {
    logError("Could not find quest at given address!");
    process.exit(1);
  }

  const encodedQuestState = questAccount.data;

  const _decodedQuest = QuestAccountLayout.decode(encodedQuestState) as QuestState;

  const questState = {
    isInitialized: !!_decodedQuest.isInitialized,
    publisher: new PublicKey(_decodedQuest.publisherPubkey),                        // alice pub key
    ata_quest: new PublicKey(_decodedQuest.questAtaPubkey),                         // alice temp token account
  };

  const { publisher, ata_quest} = questState;

  const claimer_pubkey = bobKeypair.publicKey;
  console.log('quest State :', questState);

  const PDA = await PublicKey.findProgramAddress([Buffer.from("quest")], questProgramId);

  const claimInstruction = new TransactionInstruction({
    programId: questProgramId,
    data: Buffer.from(Uint8Array.of(1, ...new BN(1).toArray("le", 8))),
    keys: [
      { pubkey: claimer_pubkey, isSigner: true, isWritable: false },                          // 1  signer bob
      { pubkey: ata_claimer_pubkey, isSigner: false, isWritable: true },                      // 3  receiver bob token account pubkey
      { pubkey: ata_quest, isSigner: false, isWritable: true },                               // 4  ata_quest account pubkey
      { pubkey: publisher, isSigner: false, isWritable: true },                               // 5  alice pub key
      { pubkey: quest_pubkey, isSigner: false, isWritable: true },                            // 7  quest_account
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },                       // 8  token_program
      { pubkey: PDA[0], isSigner: false, isWritable: false },                                 // 9  pda_account
    ]
  });

  console.log("Sending Bob's claim transaction...");
  
  let tx = new Transaction().add(claimInstruction);

  await connection.sendTransaction(
    tx,
    [ bobKeypair ],
    { 
      skipPreflight: false,
      preflightCommitment: "confirmed"
    }
  );

  // sleep to allow time to update
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("✨Trade successfully executed. All temporary accounts closed✨\n");
  
  console.table([
    {
      "Bob Token Account X": await getTokenBalance(ata_claimer_pubkey, connection),
      // "Quest USDT": await getTokenBalance(ata_quest, connection),
    },
  ]);

  console.log("");
};

bob();
