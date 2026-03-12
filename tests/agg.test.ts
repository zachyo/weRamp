import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("agg (Delivery Verifier) contract tests", () => {
  it("should allow a user to initiate verification", () => {
    const expectedAmount = 100000000n; // 1 sBTC in satoshis

    const { result } = simnet.callPublicFn(
      "agg",
      "initiate-verification",
      [Cl.uint(expectedAmount)],
      wallet1,
    );

    expect(result).toBeOk(Cl.bool(true));

    // Check map entry
    // Using simnet.callReadOnlyFn as simnet.getDataVar is for data-vars only
    const statusRes = simnet.callReadOnlyFn(
      "agg",
      "get-verification-status",
      [Cl.principal(wallet1)],
      wallet1,
    );

    expect(statusRes.result).toBeSome(
      Cl.tuple({
        "expected-amount": Cl.uint(expectedAmount),
        status: Cl.stringAscii("pending"),
        timestamp: Cl.uint(BigInt(simnet.blockHeight)),
      }),
    );
  });

  it("should not allow initiating multiple pending verifications for the same user", () => {
    simnet.callPublicFn(
      "agg",
      "initiate-verification",
      [Cl.uint(100n)],
      wallet1,
    );

    const { result } = simnet.callPublicFn(
      "agg",
      "initiate-verification",
      [Cl.uint(200n)],
      wallet1,
    );

    expect(result).toBeErr(Cl.uint(101n)); // ERR-ALREADY-PENDING
  });

  it("should allow confirming delivery and refunding the fee", () => {
    // 1. Initiate
    simnet.callPublicFn(
      "agg",
      "initiate-verification",
      [Cl.uint(100n)],
      wallet2,
    );

    // 2. Confirm
    const txProof = "0x" + "a".repeat(64);
    const { result } = simnet.callPublicFn(
      "agg",
      "confirm-delivery",
      [Cl.bufferFromHex(txProof)],
      wallet2,
    );

    expect(result).toBeOk(Cl.stringAscii("verified"));

    // 3. Status should be none
    const statusRes = simnet.callReadOnlyFn(
      "agg",
      "get-verification-status",
      [Cl.principal(wallet2)],
      wallet2,
    );
    expect(statusRes.result).toBeNone();
  });

  it("should fail to confirm if no pending verification exists", () => {
    const txProof = "0x" + "b".repeat(64);
    const { result } = simnet.callPublicFn(
      "agg",
      "confirm-delivery",
      [Cl.bufferFromHex(txProof)],
      wallet1,
    );

    expect(result).toBeErr(Cl.uint(404n)); // ERR-NOT-FOUND
  });
});
