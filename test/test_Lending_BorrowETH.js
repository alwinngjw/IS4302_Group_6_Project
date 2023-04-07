const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions"); //npm install truffle-assertions
const BigNumber = require('bignumber.js'); // npm install bignumber.js
var assert = require("assert");
const { on } = require("events");
const oneEth = new BigNumber(1000000000000000000); // 1 eth

var Avax = artifacts.require("../contracts/Avax.sol");
var Reserves = artifacts.require("../contracts/Reserves.sol");
var LiquidityPool =  artifacts.require("../contracts/LiquidityPool.sol");
var PriceFeed = artifacts.require("../contracts/PriceFeed.sol");
var Lending = artifacts.require("../contracts/Lending.sol");

contract("Lending Contract (Borrow ETH function)", function (accounts) {
    before(async () => {
      avaxInstance = await Avax.deployed();
      priceFeedInstance = await PriceFeed.deployed();
      reservesInstance = await Reserves.deployed();
      liquidityPoolInstance = await LiquidityPool.deployed();
      lendingInstance = await Lending.deployed();
    });
    console.log("Testing Lending contract");
  
    //1. Testing Avax getCredit and checkCredit function
    it("1. Testing whether ETH borrow function can take in 0 collateral", async () => {
      await truffleAssert.reverts(
        lendingInstance.borrowEth({ from: accounts[5], value: 0 }),
        "Please put more collateral"
      );
    });

    it("2. Testing Percentage calculation", async () => {
      let fee = await lendingInstance.calculatePercentage(
        BigNumber(0.95 * oneEth),
        8000
      ); 

      fee = Number(fee / oneEth);

      await assert.strictEqual(
        fee,
        0.76,
        "The percentage calculation is Wrong!."
      );
    });

    it("3. Testing whether User, Reserves and LP receives and deduct the correct amount of ETH respectively", async () => {
       let expectedLoanAmount = await lendingInstance.calculatePercentage(BigNumber(0.95 * oneEth), 8000);
       expectedLoanAmount = expectedLoanAmount/ oneEth

       // initialise by Letting the owner transfer 1 Eth over for testing
       await liquidityPoolInstance.transferEth({from : accounts[0], value : oneEth}) 

       //Get Reserves Original Balance
       let reservesBalanceBefore = await web3.eth.getBalance(
         reservesInstance.address
       );
       reservesBalanceBefore = Number(reservesBalanceBefore / oneEth);

       //Get LP Original Balance
       let LPBalanceBefore = await web3.eth.getBalance(
         liquidityPoolInstance.address
       );
       LPBalanceBefore = Number(LPBalanceBefore / oneEth);

       //Get Account 5 original balance
       let originalBalance = await web3.eth.getBalance(accounts[5]);
       originalBalance = Number(originalBalance / oneEth);
  
       //Use Account 5 to borrow 1 Eth 
       await lendingInstance.borrowEth({ from: accounts[5], value: oneEth }); 

       // Get the new Balance of Account 5 as the balance of the Account will change, Does not reset as ganache accounts are live
       let newBalance = await web3.eth.getBalance(accounts[5]);
        newBalance = Number(newBalance / oneEth);

        //Calculate the expected Balance using the original Balance, from 100 Eth - 1 Eth + 0.76 Eth 
        let expectedBalance = ((originalBalance - (oneEth / oneEth)) + expectedLoanAmount);
        expectedBalance = Number(expectedBalance);

        //Calculate Reserves Expected Balance
        reservesBalanceExpected = reservesBalanceBefore + 0.05;
        reservesBalanceExpected = Number(reservesBalanceExpected);

        //Get Reserves Expected Balance
        reservesBalanceAfter = await web3.eth.getBalance(
          reservesInstance.address
        );
        reservesBalanceAfter = Number(reservesBalanceAfter / oneEth);

        //Calculate LP Expected Balance
        LPBalanceExpected = LPBalanceBefore - 0.76;
        LPBalanceExpected = Number(LPBalanceExpected);

        //Get LP Expected Balance
        LPBalanceAfter = await web3.eth.getBalance(
          liquidityPoolInstance.address
        );
        LPBalanceAfter = Number(LPBalanceAfter / oneEth);
        
       //console.log("This is the LP Balance after " + LPBalanceAfter);
          
        await assert.strictEqual(
          Math.floor(expectedBalance),
          Math.floor(newBalance),
          "The Expected Account Balance is Wrong!."
        );

        await assert.strictEqual(
          reservesBalanceExpected,
          reservesBalanceAfter,
          "The Expected Reserves Balance is Wrong!."
        );
        
        await assert.strictEqual(
          LPBalanceExpected,
          LPBalanceAfter,
          "The Expected LP Balance is Wrong!."
        );
      });
  });