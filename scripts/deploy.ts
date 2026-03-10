/**
 * Deploy agg.clar to the Stacks Testnet
 *
 * Usage:
 *   npx ts-node scripts/deploy.ts
 *
 * Required env vars (in .env.local or shell):
 *   DEPLOYER_MNEMONIC  — 24-word seed phrase for the deployer wallet
 *   STACKS_NETWORK     — "testnet" | "mainnet" (default: testnet)
 */

import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  fetchNonce,
} from "@stacks/transactions";
import { STACKS_TESTNET, STACKS_MAINNET } from "@stacks/network";
import { generateWallet, getStxAddress } from "@stacks/wallet-sdk";
import fs from "fs";
import path from "path";

async function deploy() {
  const mnemonic = process.env.DEPLOYER_MNEMONIC;
  if (!mnemonic) {
    console.error("❌ DEPLOYER_MNEMONIC environment variable is not set.");
    process.exit(1);
  }

  const networkName = process.env.STACKS_NETWORK ?? "testnet";
  const network = networkName === "mainnet" ? STACKS_MAINNET : STACKS_TESTNET;

  // Load the Clarity contract source
  const contractPath = path.join(__dirname, "../contracts/agg.clar");
  const codeBody = fs.readFileSync(contractPath, "utf8");

  // Derive deployer account from mnemonic
  const wallet = await generateWallet({ secretKey: mnemonic, password: "" });
  const account = wallet.accounts[0];

  const senderAddress = getStxAddress({
    account,
    network,
    // transactionVersion: network.transactionVersion,
  });
  console.log(`📡 Deploying agg.clar from: ${senderAddress}`);
  console.log(`🌐 Network: ${networkName}`);

  // Get current nonce
  const nonce = await fetchNonce({ address: senderAddress, network });

  const transaction = await makeContractDeploy({
    contractName: "agg",
    codeBody,
    network,
    senderKey: account.stxPrivateKey,
    nonce,
    // anchorMode: AnchorMode.Any,
    fee: 50_000n, // 0.05 STX
  });

  const result = await broadcastTransaction({ transaction, network });

  if ("error" in result) {
    console.error("❌ Broadcast failed:", result.error, result.reason);
    process.exit(1);
  }

  console.log(`✅ Contract deployed successfully!`);
  console.log(`   TX ID: ${result.txid}`);
  console.log(
    `   View:  https://explorer.hiro.so/txid/${result.txid}?chain=${networkName}`,
  );
  console.log(`\n💡 Add these to your .env.local:`);
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${senderAddress}`);
  console.log(`   NEXT_PUBLIC_CONTRACT_NAME=agg`);
}

deploy().catch((err) => {
  console.error(err);
  process.exit(1);
});
