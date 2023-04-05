const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions"); //npm install truffle-assertions
const BigNumber = require('bignumber.js'); // npm install bignumber.js
var assert = require("assert");

const oneEth = new BigNumber(1000000000000000000); // 1 eth

var Avax = artifacts.require("../contracts/Avax.sol");
var Reserves = artifacts.require("../contracts/Reserves.sol");
var LiquidityPool =  artifacts.require("../contracts/LiquidityPool.sol");
var PriceFeed = artifacts.require("../contracts/PriceFeed.sol");
var Lending = artifacts.require("../contracts/Lending.sol");

contract("Lending contract (Top up AVAX collateral Function)", function (accounts) {
  before(async () => {
    avaxInstance = await Avax.deployed();
    priceFeedInstance = await PriceFeed.deployed();
    reservesInstance = await Reserves.deployed();
    liquidityPoolInstance = await LiquidityPool.deployed();
    lendingInstance = await Lending.deployed();
  });

  it("1. Initialise borrowing", async () => {
    await liquidityPoolInstance.InitialiseLP();
    await avaxInstance.getCredit({ from: accounts[5], value: oneEth });
    await lendingInstance.borrowAVAX(100, { from: accounts[5] });

    let userBalance = await avaxInstance.checkCredit({ from: accounts[5] });
    userBalance = Number(userBalance);
  });

  it("2. Testing Top up function when user does not have enough Avax tokens", async () => {
    await truffleAssert.reverts(
      lendingInstance.topUpAVAXCollateral(100, { from: accounts[5] }),
      "You do not have enough AVAX token!"
    );
  });

  it("3. Testing Top up function whether a user without a debt can top up", async () => {
    await truffleAssert.reverts(
      lendingInstance.topUpAVAXCollateral(100, { from: accounts[6] }),
      "You do not have any outstanding debt"
    );
  });

  it("4. Testing Top up function, whether Lending contract and User Balance has updated the new amount", async () => {
    await avaxInstance.getCredit({ from: accounts[5], value: oneEth });
    await lendingInstance.topUpAVAXCollateral(100, { from: accounts[5] });
    //Get Users new blance after top up
    let userBalance = await avaxInstance.checkCredit({ from: accounts[5] });
    userBalance = Number(userBalance);

    let newHoldingCollateral = await lendingInstance.getHoldingAVAXCollateral();
    newHoldingCollateral = Number(newHoldingCollateral);
    
    await assert.strictEqual(
      newHoldingCollateral,
      195,
      "The amount of Avax received is not correct."
    );

    //Initially had 76 (from loan) + 100 Tokens - 100 Tokens (After top Up)
    await assert.strictEqual(
      userBalance,
      76,
      "The amount of Avax received is not correct."
    );
  });
});

contract("Lending contract (AVAX Liquidation Function)", function (accounts) {
  before(async () => {
    avaxInstance = await Avax.deployed();
    priceFeedInstance = await PriceFeed.deployed();
    reservesInstance = await Reserves.deployed();
    liquidityPoolInstance = await LiquidityPool.deployed();
    lendingInstance = await Lending.deployed();
  });

  it("1. Testing Liquidation function, whether non owners can call the function", async () => {
    await truffleAssert.reverts(
      lendingInstance.liquidateAVAX({ from: accounts[5] }),
      "Only the Owner can call this function"
    );
  });

  it("2. Testing Liquidation function", async () => {
    await liquidityPoolInstance.InitialiseLP();
    await avaxInstance.getCredit({ from: accounts[5], value: oneEth });
    await lendingInstance.borrowAVAX(100, { from: accounts[5] });

    await lendingInstance.liquidateAVAX({ from: accounts[0] });

    let userBalance = await avaxInstance.checkCredit({ from: accounts[5] });
    userBalance = Number(userBalance);

    await assert.strictEqual(
      userBalance,
      76, //User forfeits his collateral
      "The amount of Avax received is not correct."
    );

    let LPBalance = await liquidityPoolInstance.getAvaxTvl();
    LPBalance = Number(LPBalance);

    await assert.strictEqual(
      LPBalance,
      1019, //Collateral taken was 95, but loaned only 76, upon liquidation, Lending contract absorbs all collateral and sends it back to the LP
      "The amount of Avax received is not correct."
    );
  });

  it("3. Test whether loan records have been removed", async () => {
    await truffleAssert.reverts(
        lendingInstance.repayAVAXDebt({ from: accounts[5] }),
        "You do not have any outstanding debt"
      );
  });
  it("4. Test whether Avax Liquidation Counter has increased", async () => {
    let repaymentCounter = await lendingInstance.getUserTotaAVAXLiquidationAmount({from : accounts[5]});
    repaymentCounter = Number(repaymentCounter);

    expectedCount = Number(1);
    await assert.strictEqual(
      repaymentCounter,
      expectedCount, 
      "The return counter is wrong!"
    );
  });
});