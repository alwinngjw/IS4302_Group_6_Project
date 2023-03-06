const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions"); //npm install truffle-assertions
const BigNumber = require('bignumber.js'); // npm install bignumber.js
var assert = require("assert");

const oneEth = new BigNumber(1000000000000000000); // 1 eth

var USDC = artifacts.require("../contracts/USDC.sol");
var Reserves = artifacts.require("../contracts/Reserves.sol");
var LiquidityPool =  artifacts.require("../contracts/LiquidityPool.sol");


contract('USDC', function(accounts) {
    before (async() => {
        usdcInstance = await USDC.deployed();
    })
    console.log("Testing USDC contract");

    //1. Testing USDC getCredit and checkCredit function
    it('1. Testing USDC Get Credit and Check Credit functions', async() => {
        await usdcInstance.getCredit({from: accounts[1], value: oneEth});
        let tokensConverted = await usdcInstance.checkCredit({from: accounts[1]});
        tokensConverted = Number(tokensConverted);

        await assert.strictEqual(
            tokensConverted,
            100,
            "The amount of tokens converted is not equivalent to the amount of ether put in."
        );
    });
});

contract('Reserves', function(accounts) {
    before (async() => {
        usdcInstance = await USDC.deployed();
        reservesInstance = await Reserves.deployed();
    })
    console.log("Testing Reserves contract");

    //2. Testing Reserves addEthToReserves and getTotalEthHolding function
    it('2. Testing Reserves Add Ether To Reserves and Get Total Ether Holding function', async() => {
        await reservesInstance.addEthToReserve({from: accounts[1], value: oneEth});
        let totalEtherInReserves = await reservesInstance.getTotalEthHolding();
        totalEtherInReserves = Number(totalEtherInReserves);

        await assert.strictEqual(
            totalEtherInReserves ,
            1,
            "The amount of ether in Reserves contract is not correct."
        );
    });

    //3. Testing Reserves intialiseReserves function
    it('3. Testing Reserves Intialise Reserves function', async() => {
        await reservesInstance.initialiseReserves();
        let totalUSDCInReserves = await reservesInstance.getTotalUSDCHolding();
        totalUSDCInReserves = Number(totalUSDCInReserves);

        await assert.strictEqual(
            totalUSDCInReserves,
            1000,
            "The amount of USDC Tokens in Reserves contract is not correct."
        );
    });

    //4. Testing Reserves addUSDCToReserves and getTotalUSDCHolding function
    it('4. Testing Reserves Add USDC To Reserves and Get Total USDC Holding function', async() => {
        await reservesInstance.addUSDCToReserve(100, {from: accounts[1]});
        let totalUSDCInReserves = await reservesInstance.getTotalUSDCHolding();
        totalUSDCInReserves = Number(totalUSDCInReserves);

        await assert.strictEqual(
            totalUSDCInReserves,
            1100,
            "The amount of USDC Tokens in Reserves contract is not correct."
        );
    });

    //5. Testing Reserves withdrawEth function
    it('5. Testing Reserves Withdraw Ether function', async() => {
        await reservesInstance.withdrawEth(1, {from: accounts[0]});
        let EtherLeftAfterWithdrawal = await reservesInstance.getTotalEthHolding();
        EtherLeftAfterWithdrawal = Number(EtherLeftAfterWithdrawal);

        await assert.strictEqual(
            EtherLeftAfterWithdrawal,
            0,
            "The amount of Ether left in Reserves after withdrawal is not correct."
        );
    });

    //6. Testing Reserves withdrawEth function (Expect to fail)
    it('6. Testing Reserves Withdraw Ether function (Expect to fail)', async() => {
        await truffleAssert.reverts(
            reservesInstance.withdrawEth(1, {from: accounts[0]}),
            "Please ensure total ETH Reserve has enough amount!"
        );
    });

    //7. Testing Reserves withdrawUSDC function
    it('7. Testing Reserves Withdraw USDC function', async() => {
        await reservesInstance.withdrawUSDC(1100, {from: accounts[0]});
        let usdcLeftAfterWithdrawal = await reservesInstance.getTotalUSDCHolding();
        usdcLeftAfterWithdrawal = Number(usdcLeftAfterWithdrawal);

        await assert.strictEqual(
            usdcLeftAfterWithdrawal,
            0,
            "The amount of USDC left in Reserves after withdrawal is not correct."
        );
    });

    //8. Testing Reserves withdrawUSDC function (Expect to fail)
    it('8. Testing Reserves Withdraw USDC function (Expect to fail)', async() => {
        await truffleAssert.reverts(
            reservesInstance.withdrawUSDC(100, {from: accounts[0]}),
            "Please ensure total USDC Reserve has enough amount!"
        );
    });
});

contract('Liquidity Pool', function(accounts) {
    before (async() => {
        usdcInstance = await USDC.deployed();
        reservesInstance = await Reserves.deployed();
        liquidityPoolInstnace = await LiquidityPool.deployed();
    })
    console.log("Testing Liquidity Pool contract");

    //9. 
    it('9.', async() => {
        
    });
});