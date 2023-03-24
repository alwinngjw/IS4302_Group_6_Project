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
       let fee = await lendingInstance.calculatePercentage(BigNumber(0.95 * oneEth), 8000);
       fee = fee / oneEth

       //console.log(Number(fee));

       await liquidityPoolInstance.transferEth({from : accounts[0], value : oneEth})

       //Test Reserves
       let reservesBalanceBefore = await web3.eth.getBalance(
         reservesInstance.address
       );
       reservesBalanceBefore = Number(reservesBalanceBefore / oneEth);

       //Test LP
       let LPBalanceBefore = await web3.eth.getBalance(
         liquidityPoolInstance.address
       );

       LPBalanceBefore = Number(LPBalanceBefore / oneEth);
       console.log("This is the LP Balance before " + LPBalanceBefore);

       let originalBalance = await web3.eth.getBalance(accounts[5]);
       originalBalance = originalBalance / oneEth;
       originalBalance = Number(originalBalance);
       //console.log("This is the Original Balance = " + originalBalance);
  
        //await liquidityPoolInstance.transferEth({from: accounts[0], value: (oneEth)})
        await lendingInstance.borrowEth({ from: accounts[5], value: oneEth }); 

        let newBalance = await web3.eth.getBalance(accounts[5]);
        newBalance = Number(newBalance / oneEth);
        //console.log("This is the New Balance = " + newBalance);

        let expectedBalance = ((originalBalance - (oneEth / oneEth)) + fee);
        expectedBalance = Number(expectedBalance);
        //console.log("This is the Expected Balance = " + (expectedBalance));

        reservesBalanceAfter = reservesBalanceBefore + 0.05;
        reservesBalanceAfter = Number(reservesBalanceAfter);

        LPBalanceExpected = LPBalanceBefore - 0.76;
        LPBalanceExpected = Number(LPBalanceExpected);

        LPBalanceAfter = await web3.eth.getBalance(
          liquidityPoolInstance.address
        );
        LPBalanceAfter = Number(LPBalanceAfter / oneEth);
        
       //console.log("This is the LP Balance after " + LPBalanceAfter);
          
        await assert.strictEqual(
          Math.floor(newBalance),
          Math.floor(expectedBalance),
          "The percentage calculation is Wrong!."
        );

        await assert.strictEqual(
          Math.floor(reservesBalanceBefore),
          Math.floor(reservesBalanceAfter),
          "The percentage calculation is Wrong!."
        );

        
        await assert.strictEqual(
          LPBalanceExpected,
          LPBalanceAfter,
          "The percentage calculation is Wrong!."
        );
      });
    
  /*
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
    
    it("9. Testing Repay function (Whether reserves receives comission fee)", async () => {
      let reservesBalance = await reservesInstance.getTotalAvaxHolding();
      reservesBalance = Number(reservesBalance);
  
      await assert.strictEqual(
        reservesBalance,
        5, //After deducting 5% comission fee, the reserves should receive 5 tokens
        "The amount of Avax received is not correct."
      );
    });
    */
  });