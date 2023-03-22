const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions"); //npm install truffle-assertions
const BigNumber = require('bignumber.js'); // npm install bignumber.js
var assert = require("assert");
BigNumber.config({ DECIMAL_PLACES: 2 })
const oneEth = new BigNumber(1000000000000000000); // 1 eth

var Avax = artifacts.require("../contracts/Avax.sol");
var Reserves = artifacts.require("../contracts/Reserves.sol");
var LiquidityPool =  artifacts.require("../contracts/LiquidityPool.sol");
var PriceFeed = artifacts.require("../contracts/PriceFeed.sol");
var Lending = artifacts.require("../contracts/Lending.sol");

contract("Lending Contract (Borrow Avax function)", function (accounts) {
    before(async () => {
      avaxInstance = await Avax.deployed();
      priceFeedInstance = await PriceFeed.deployed();
      reservesInstance = await Reserves.deployed();
      liquidityPoolInstance = await LiquidityPool.deployed();
      lendingInstance = await Lending.deployed();
    });
    console.log("Testing Lending contract");
  
    //1. Testing Avax getCredit and checkCredit function
    it("1. Testing whether AVAX borrow function can take in 0 collateral", async () => {
      await truffleAssert.reverts(
        lendingInstance.borrowAVAX(0, { from: accounts[5] }),
        "Please put more collateral"
      );
    });
  
    it("2. Testing whether User has enough AVAX tokens in wallet", async () => {
      await truffleAssert.reverts(
        lendingInstance.borrowAVAX(10, { from: accounts[5] }),
        "You do not have enough AVAX token!"
      );
    });
  
    it("3. Testing Intialise LP function in LP contract", async () => {
      await liquidityPoolInstance.InitialiseLP();
      let totalAvaxInLP = await liquidityPoolInstance.getAvaxTvl();
      totalAvaxInLP = Number(totalAvaxInLP);
  
      await assert.strictEqual(
        totalAvaxInLP,
        1000,
        "The amount of Avax Tokens in LP contract is not correct."
      );
    });
  
    it("4. Testing whether User can borrow AVAX tokens", async () => {
      //Intialise the Liquidity Pool
      //First step is to get Avax tokens (Avax credit function has already been tested above)
      await avaxInstance.getCredit({ from: accounts[5], value: oneEth });
      await lendingInstance.borrowAVAX(100, { from: accounts[5] }); //Borrow 100 Avax tokens, should get back 76
      let loanAvaxTokens = await avaxInstance.balanceOf(accounts[5]);
      loanAvaxTokens = Number(loanAvaxTokens);
  
      await assert.equal(
        loanAvaxTokens,
        76,
        "The percentage calculation is Wrong!."
      );
    });
  
    it("5. Testing whether LP has deducted the correct tokens", async () => {
      let totalAvaxInLP = await liquidityPoolInstance.getAvaxTvl();
      totalAvaxInLP = Number(totalAvaxInLP);
  
      await assert.strictEqual(
        totalAvaxInLP,
        1000 - 76, //LP loaned out 85 tokens from 100 tokens (115%)
        "The amount of Avax Tokens Loaned out is not correct."
      );
    });
  
    it("6. Testing whether Lending Contract has received the correct collateral", async () => {
      let totalAvaxInLending = await lendingInstance.getHoldingAVAXCollateral();
      totalAvaxInLending = Number(totalAvaxInLending);
  
      await assert.strictEqual(
        totalAvaxInLending,
        95, //Lending should receive 100 Avax tokens
        "The amount of Avax collateral received is not correct."
      );
    });
  
    it("7. Testing whether msg.sender received correct amount of Avax tokens", async () => {
      let totalAvaxInUserWallet = await avaxInstance.checkCredit({
        from: accounts[5],
      });
      totalAvaxInUserWallet = Number(totalAvaxInUserWallet);
  
      await assert.strictEqual(
        totalAvaxInUserWallet,
        76, //Lending should receive 100 Avax tokens
        "The amount of Avax received is not correct."
      );
    });
  
    it("8. Testing to see whether msg.sender Avax collateral amount in USD is correct", async () => {
      let AvaxAmountInUSD = await lendingInstance.getUserAVAXCollateralAmountInUSD({
        from: accounts[5],
      });
      AvaxAmountInUSD = Number(AvaxAmountInUSD);
  
      await assert.strictEqual(
        AvaxAmountInUSD,
        9500,
        "The amount of Avax in USD recorded is not correct."
      );
    });
    // add a test that will test whether reserves received the 5% commission fee
  });