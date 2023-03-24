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

contract('PriceFeed', function(accounts) {
    before (async() => {
        priceFeedInstance = await PriceFeed.deployed();
    })
    console.log("Testing PriceFeed Oracle");

    it('1. Testing initial price of ETH', async() => {
        let firstPriceOfEth = await priceFeedInstance.getEthPriceFirst();
        firstPriceOfEth = Number(firstPriceOfEth);

        await assert.strictEqual(
            firstPriceOfEth,
            1000,
            "The initial price is wrong!"
        );
    });

    it('2. Testing Liquidation price of ETH', async() => {
        let liquidationPriceOfEth = await priceFeedInstance.getEthPriceToLiquidate();
        liquidationPriceOfEth = Number(liquidationPriceOfEth);

        await assert.strictEqual(
            liquidationPriceOfEth,
            850,
            "The liquidation price is wrong!"
        );
    });

    it('3. Testing initial price of AVAX', async() => {
        let liquidationPriceOfAVAX = await priceFeedInstance.getAvaxPriceFirst();
        liquidationPriceOfAVAX = Number(liquidationPriceOfAVAX);

        await assert.strictEqual(
            liquidationPriceOfAVAX,
            100,
            "The initial price is wrong!"
        );
    });

    it('4. Testing Liquidation price of AVAX', async() => {
        let liquidationPriceOfAVAX = await priceFeedInstance.getAvaxPriceToLiquidate();
        liquidationPriceOfAVAX = Number(liquidationPriceOfAVAX);

        await assert.strictEqual(
            liquidationPriceOfAVAX,
            85,
            "The liquidation price is wrong!"
        );
    });
});