//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected

const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;
const buildPoseidon = require("circomlibjs").buildPoseidon;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("Mastermind Variation test", function () {
  let poseidon;
  let F;

  it("Should give 3 hits for 3 correct guesses of colors and their positions", async () => {
    poseidon = await buildPoseidon();
    F = poseidon.F;

    // our solutions will be 2,4,5
    const privSolnA = 2;
    const privSolnB = 4;
    const privSolnC = 5;

    // salt is taken as a random number
    const privSalt = Math.floor(Math.random() * 10 ** 10);
    //console.log(privSalt);

    // public solution hash
    const pubSolnHash = poseidon([privSalt, privSolnA, privSolnB, privSolnC]);

    const circuit = await wasm_tester(
      "contracts/circuits/MastermindVariation.circom"
    );
    await circuit.loadConstraints();

    // this input corresponds to all correct guesses and gives 3 hits
    const INPUT = {
      pubGuessA: 2,
      pubGuessB: 4,
      pubGuessC: 5,
      pubNumHit: 3,
      pubNumBlow: 0,
      pubSolnHash: F.toObject(pubSolnHash),
      privSolnA: privSolnA,
      privSolnB: privSolnB,
      privSolnC: privSolnC,
      privSalt: privSalt,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
  });

  it("Should give 1 hits and 1 blows", async () => {
    poseidon = await buildPoseidon();
    F = poseidon.F;

    const privSolnA = 1;
    const privSolnB = 2;
    const privSolnC = 3;

    const privSalt = Math.floor(Math.random() * 10 ** 10);

    const pubSolnHash = poseidon([privSalt, privSolnA, privSolnB, privSolnC]);

    const circuit = await wasm_tester(
      "contracts/circuits/MastermindVariation.circom"
    );
    await circuit.loadConstraints();
    const INPUT = {
      pubGuessA: 1,
      pubGuessB: 3,
      pubGuessC: 4,
      pubNumHit: 1,
      pubNumBlow: 1,
      pubSolnHash: F.toObject(pubSolnHash),
      privSolnA: privSolnA,
      privSolnB: privSolnB,
      privSolnC: privSolnC,
      privSalt: privSalt,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
  });

  it("Should give 0 hits and 2 blows", async () => {
    poseidon = await buildPoseidon();
    F = poseidon.F;

    const privSolnA = 1;
    const privSolnB = 2;
    const privSolnC = 3;

    const privSalt = Math.floor(Math.random() * 10 ** 10);

    const pubSolnHash = poseidon([privSalt, privSolnA, privSolnB, privSolnC]);

    const circuit = await wasm_tester(
      "contracts/circuits/MastermindVariation.circom"
    );
    await circuit.loadConstraints();
    const INPUT = {
      pubGuessA: 2,
      pubGuessB: 3,
      pubGuessC: 4,
      pubNumHit: 0,
      pubNumBlow: 2,
      pubSolnHash: F.toObject(pubSolnHash),
      privSolnA: privSolnA,
      privSolnB: privSolnB,
      privSolnC: privSolnC,
      privSalt: privSalt,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
  });
});
