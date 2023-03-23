/*
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

contract("Lending contract (Repay AVAX Function)", function (accounts) {
    before(async () => {
      avaxInstance = await Avax.deployed();
      priceFeedInstance = await PriceFeed.deployed();
      reservesInstance = await Reserves.deployed();
      liquidityPoolInstance = await LiquidityPool.deployed();
      lendingInstance = await Lending.deployed();
    });
  
    it("1. Testing Repay function (whether a user that has no debt can call the Repay function)", async () => {
      //Test whether the msg.sender owns the debt
      //Debt is with account 5 not 6
      await truffleAssert.reverts(
        lendingInstance.repayAVAXDebt({ from: accounts[6] }),
        "You do not have any outstanding debt"
      );
    });
  
    it("2. Testing Repay function (Whether user recieves back Collateral)", async () => {
      await liquidityPoolInstance.InitialiseLP();
      await avaxInstance.getCredit({ from: accounts[5], value: oneEth });
      await lendingInstance.borrowAVAX(100, { from: accounts[5] }); 
  
      await lendingInstance.repayAVAXDebt({ from: accounts[5] });
      let userBalance = await avaxInstance.checkCredit({ from: accounts[5] });
      userBalance = Number(userBalance);
  
      await assert.strictEqual(
        userBalance,
        95, //Commission fee has already been deducted when user borrowed, thus collateral taken is 95%
        "The amount of Avax received is not correct."
      );
    });

    it("3. Testing Repay function (Whether LP received back the loan funds", async () => {
    
        let LPBalance = await liquidityPoolInstance.getAvaxTvl();
        LPBalance = Number(LPBalance);
    
        await assert.strictEqual(
          LPBalance,
          1000, //Commission fee has already been deducted when user borrowed, thus collateral taken is 95%
          "The amount of Avax received is not correct."
        );
      });

    it("4. Test whether loan records have been removed", async () => {
        await truffleAssert.reverts(
            lendingInstance.repayAVAXDebt({ from: accounts[5] }),
            "You do not have any outstanding debt"
          );
      });
  });
  */
  