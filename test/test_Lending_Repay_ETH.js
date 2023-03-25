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

contract("Lending contract (Repay ETH Function)", function (accounts) {
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
        lendingInstance.repayEth({ from: accounts[6] }),
        "You do not have any outstanding debt"
      );
    });
  
    it("2. Testing Repay function (Whether user and LP receive back ETH respectively)", async () => {

      await liquidityPoolInstance.transferEth({
        from: accounts[0],
        value: oneEth,
      });

      await lendingInstance.borrowEth({ from: accounts[5], value : oneEth });

      UserBalanceAfterBorrow = await web3.eth.getBalance(
        accounts[5]
      );
      UserBalanceAfterBorrow = Number(UserBalanceAfterBorrow / oneEth);
      //console.log("User balance after borrow " + UserBalanceAfterBorrow);

      await lendingInstance.repayEth({ from: accounts[5], value : oneEth * 0.76 });

      let expectedLPBalance = 1;

      LPBalanceAfter = await web3.eth.getBalance(
        liquidityPoolInstance.address
      );
      LPBalanceAfter = Number(LPBalanceAfter / oneEth);

      await assert.strictEqual(
        expectedLPBalance,
        LPBalanceAfter, 
        "The amount of ETH received is not correct."
      );

      UserBalanceAfterRepay = await web3.eth.getBalance(
        accounts[5]
      );

      let expectedUserBalance = UserBalanceAfterBorrow - 0.76 + 0.95;
      expectedUserBalance = Number(expectedUserBalance);
      UserBalanceAfterRepay = Number(UserBalanceAfterRepay / oneEth);
      //console.log("Expected User balance " +  expectedUserBalance);
      //console.log("User balance after repay " +  UserBalanceAfterRepay);

      await assert.strictEqual(
        Math.floor(expectedUserBalance),
        Math.floor(UserBalanceAfterRepay), 
        "The amount of ETH received is not correct."
      );
    });

    it("3. Test whether loan records have been removed", async () => {
        await truffleAssert.reverts(
            lendingInstance.repayEth({ from: accounts[5] }),
            "You do not have any outstanding debt"
          );
      });
  });