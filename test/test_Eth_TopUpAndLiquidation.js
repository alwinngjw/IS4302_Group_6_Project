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

contract("Lending contract (Top up ETH collateral function)", function (accounts) {
    before(async () => {
      avaxInstance = await Avax.deployed();
      priceFeedInstance = await PriceFeed.deployed();
      reservesInstance = await Reserves.deployed();
      liquidityPoolInstance = await LiquidityPool.deployed();
      lendingInstance = await Lending.deployed();
    });
  
    it("1. Testing Top up function", async () => {

      await liquidityPoolInstance.transferEth({
        from: accounts[0],
        value: oneEth,
      });

      await lendingInstance.borrowEth({ from: accounts[5], value: oneEth });

      let originalBalance = await web3.eth.getBalance(accounts[5]);

      originalBalance = originalBalance / oneEth;
      originalBalance = Number(originalBalance);

      await lendingInstance.topUpETHCollateral({from : accounts[5], value : oneEth});

      let expectedBalance = originalBalance - 1;
      expectedBalance = Number(expectedBalance);

      let balanceAfter = await web3.eth.getBalance(accounts[5]);
      balanceAfter = Number(balanceAfter / oneEth);

      await assert.strictEqual(
        Math.floor(balanceAfter),
        Math.floor(expectedBalance),
        "The top up function is not working!."
      );
    });

    contract("Lending contract (ETH Liquidation Function)", function (accounts) {
      before(async () => {
        avaxInstance = await Avax.deployed();
        priceFeedInstance = await PriceFeed.deployed();
        reservesInstance = await Reserves.deployed();
        liquidityPoolInstance = await LiquidityPool.deployed();
        lendingInstance = await Lending.deployed();
      });
    
      it("1. Testing Liquidation function", async () => {

        await liquidityPoolInstance.transferEth({
          from: accounts[0],
          value: oneEth,
        });

        let originalLPBalance = await web3.eth.getBalance(liquidityPoolInstance.address);
        originalLPBalance = Number(originalLPBalance / oneEth);

        await lendingInstance.borrowEth({ from: accounts[5], value: oneEth });
    
        await lendingInstance.liquidateETH();

        let expectedBalance = originalLPBalance - 0.76 + 0.95;

        let newLPBalance = await web3.eth.getBalance(liquidityPoolInstance.address);
        newLPBalance = Number(newLPBalance/ oneEth);
    
    
        await assert.strictEqual(
          expectedBalance,
          newLPBalance, //User forfeits his collateral
          "The Liquidation function is not working."
        );
    
      });
    
      it("2. Test whether loan records have been removed", async () => {
        await truffleAssert.reverts(
            lendingInstance.repayAVAXDebt({ from: accounts[5] }),
            "You do not have any outstanding debt"
          );
      });
    });
});
*/