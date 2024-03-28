import { Connection, LAMPORTS_PER_SOL, PublicKey, Signer } from "@solana/web3.js";

import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";


import { getKeypair, getPublicKey, getTokenBalance, writePublicKey } from "./utils";

const setup = async () => {

  const alicePubKey = getPublicKey("ata_alice");
  const bobPubKey = getPublicKey("ata_bob");

  const questPubkey = getPublicKey("ata_quest");

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  console.log("✨Setup complete✨\n");
  console.table([
    {
      "Alice USDT": await getTokenBalance(alicePubKey, connection),
    },
    {
      "Bob USDT": await getTokenBalance(bobPubKey, connection),
    },
    {
      "Quest ATA Account": await getTokenBalance(questPubkey, connection),
    },
  ]);
  console.log("");
};

setup();
