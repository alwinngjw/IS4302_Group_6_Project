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
    it('2. Testing Reserves Add Ether To Reserves and Get Total Ether Holding', async() => {
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
    it('4. Testing Reserves Add USDC To Reserves and Get Total USDC Holding', async() => {
        await reservesInstance.addUSDCToReserve(100, {from: accounts[1]});
        let totalUSDCInReserves = await reservesInstance.getTotalUSDCHolding();
        totalUSDCInReserves = Number(totalUSDCInReserves);

        await assert.strictEqual(
            totalUSDCInReserves,
            1100,
            "The amount of USDC Tokens in Reserves contract is not correct."
        );
    });
});