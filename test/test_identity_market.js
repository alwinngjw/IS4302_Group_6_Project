const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions"); //npm install truffle-assertions
const BigNumber = require("bignumber.js"); // npm install bignumber.js
var assert = require("assert");
const oneEth = new BigNumber(1000000000000000000); // 1 eth
const minWalletValue = 1000000;
const minTransactions = 100;

var Identity = artifacts.require("../contracts/Identity.sol");
var IdentityMarket = artifacts.require("../contracts/IdentityMarket.sol");
var IdentityToken = artifacts.require("../contracts/IdentityToken.sol");
var WalletFeed = artifacts.require("../contracts/WalletFeed.sol");

contract("Identity Market", function (accounts) {
  before(async () => {
    identityInstance = await Identity.deployed();
    identityMarketInstance = await IdentityMarket.deployed();
    identityTokenInstance = await IdentityToken.deployed();
    walletFeedInstance = await WalletFeed.deployed();
  });

  console.log("Testing Identity Market Contract");

  //1. Testing that Identity Application can be submitted
  it("1. Testing that Identity Application can be submitted", async () => {
    let createIdentity = await identityInstance.createIdentity({
      from: accounts[1],
    });
    let submitIdentity = await identityMarketInstance.submitIdentity({
      from: accounts[1],
    });

    let applicationStatus = await identityMarketInstance.getApplicationStatus(
      accounts[1]
    );

    truffleAssert.eventEmitted(createIdentity, "IdentityIssued");
    truffleAssert.eventEmitted(submitIdentity, "IdentitySubmitted");
    assert.strictEqual(
      applicationStatus.toNumber(),
      0,
      "Identity Application not created"
    );
  });

  //2. Testing that Identity Application cannot be created if user has no Identity
  it("2. Testing that Identity Application cannot be created if user has no Identity", async () => {
    await truffleAssert.reverts(
      identityMarketInstance.submitIdentity({ from: accounts[2] }),
      "Please create an identity first"
    );
  });

  //3. Testing that Identity Application can only be evaluated by contract owner
  it("3. Testing that Identity Application can only be evaluated by contract owner", async () => {
    await truffleAssert.reverts(
      identityMarketInstance.evaluateIdentity(accounts[1], {
        from: accounts[2],
      }),
      "Only the contract owner can perform this function"
    );
  });
  //4. Testing that Identity Application must exist for evaluation to take place
  it("4. Testing that Identity Application must exist for evaluation to take place", async () => {
    await truffleAssert.reverts(
      identityMarketInstance.evaluateIdentity(accounts[2]),
      "User does not have an identity application"
    );
  });
  //5. Testing that Identity Application that doesn't meet criteria is rejected
  it("5. Testing that Identity Application that doesn't meet criteria is rejected", async () => {
    // Set values to be below min criteria
    await walletFeedInstance.setWalletValue(minWalletValue - 1);
    await walletFeedInstance.setTransactionCount(minTransactions - 1);
    await identityTokenInstance.setIdentityMarket(identityMarketInstance.address);

    const evaluateIdentity = await identityMarketInstance.evaluateIdentity(
      accounts[1]
    );
    let identityRejected = await identityMarketInstance.getApplicationStatus(
      accounts[1]
    );

    truffleAssert.eventEmitted(evaluateIdentity, "IdentityRejected");
    assert.strictEqual(
      identityRejected.toNumber(),
      2,
      "Identity was not rejected"
    );
  });
  //6. Testing that Identity Application that meets criteria is approved
  it("6. Testing that Identity Application that meets criteria is approved", async () => {
    let createIdentity = await identityInstance.createIdentity({
      from: accounts[2],
    });
    let submitIdentity = await identityMarketInstance.submitIdentity({
      from: accounts[2],
    });

    let applicationStatus = await identityMarketInstance.getApplicationStatus(
      accounts[2]
    );

    truffleAssert.eventEmitted(createIdentity, "IdentityIssued");
    truffleAssert.eventEmitted(submitIdentity, "IdentitySubmitted");
    assert.strictEqual(
      applicationStatus.toNumber(),
      0,
      "Identity Application not created"
    );

    // Set values to meet min criteria
    await walletFeedInstance.setWalletValue(minWalletValue);
    await walletFeedInstance.setTransactionCount(minTransactions);
    const evaluateIdentity = await identityMarketInstance.evaluateIdentity(
      accounts[2]
    );
    let identityRejected = await identityMarketInstance.getApplicationStatus(
      accounts[2]
    );

    truffleAssert.eventEmitted(evaluateIdentity, "IdentityApproved");
    assert.strictEqual(
      identityRejected.toNumber(),
      1,
      "Identity application meeting criteria was not approved"
    );
  });
  //7. Testing that Identity Token is issued upon approval of application
  it("7. Testing that Identity Token is issued upon approval of application", async () => {
    let itBalance = await identityTokenInstance.checkITBalance(accounts[2]);

    assert.strictEqual(
      itBalance.toNumber(),
      1,
      "Identity Token was not issued to approved application"
    );
  });
  //8. Testing that Identity Token is not issued when application is rejected
  it("8. Testing that Identity Token is not issued when application is rejected", async () => {
    let itBalance = await identityTokenInstance.checkITBalance(accounts[1]);

    assert.strictEqual(
      itBalance.toNumber(),
      0,
      "Identity Token was issued to rejected application"
    );
  });
  //9. Testing that IdentityToken can only be issued by Owner
  it("9. Testing that IdentityToken can only be issued by Owner", async () => {
    await truffleAssert.reverts(
      identityTokenInstance.getIdentity({ from: accounts[1] }),
      "Only contract owner can call these functions"
    );
  });
});
