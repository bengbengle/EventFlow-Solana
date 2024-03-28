import { Connection, LAMPORTS_PER_SOL, PublicKey, Signer } from "@solana/web3.js";

import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";


import { getKeypair, getPublicKey, getTokenBalance, writePublicKey } from "./utils";


const setup = async () => {

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const adminKeypair = getKeypair("admin");
  const alicePubKey = getPublicKey("alice");
  const bobPubKey = getPublicKey("bob");

  const adminPubkey = adminKeypair.publicKey;

  const USDT = await Token.createMint(
      connection,
      adminKeypair,
      adminKeypair.publicKey,
      adminKeypair.publicKey,
      0,
      TOKEN_PROGRAM_ID
    );

  const usdt_ata_alice = await USDT.createAccount(alicePubKey);
  const usdt_ata_bob = await USDT.createAccount(bobPubKey);
  
  writePublicKey(usdt_ata_alice, `ata_alice`);
  writePublicKey(usdt_ata_bob, `ata_bob`);
  writePublicKey(USDT.publicKey, `USDT`);
   
  
  await USDT.mintTo(usdt_ata_alice, adminPubkey, [], 50);
  await USDT.mintTo(usdt_ata_bob, adminPubkey, [], 0);

  console.log("✨Setup complete✨\n");

  console.table([
    {
      "Alice USDT": await getTokenBalance(usdt_ata_alice, connection),
      "Alice ATA": usdt_ata_alice.toString(),

    },
    {
      "Bob USDT": await getTokenBalance(usdt_ata_bob, connection),
      "Bob ATA": usdt_ata_bob.toString(),
    },
    {
      // "Admin": adminPubkey.toString(),
      // "Admin USDT": await getTokenBalance(adminPubkey, connection),
    }
  ]);

};

setup();
