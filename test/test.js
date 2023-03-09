const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions"); //npm install truffle-assertions
const BigNumber = require('bignumber.js'); // npm install bignumber.js
var assert = require("assert");

const oneEth = new BigNumber(1000000000000000000); // 1 eth

var Avax = artifacts.require("../contracts/Avax.sol");
var Reserves = artifacts.require("../contracts/Reserves.sol");
var LiquidityPool =  artifacts.require("../contracts/LiquidityPool.sol");


contract('Avax', function(accounts) {
    before (async() => {
        avaxInstance = await Avax.deployed();
    })
    console.log("Testing Avax contract");

    //1. Testing Avax getCredit and checkCredit function
    it('1. Testing Avax Get Credit and Check Credit functions', async() => {
        await avaxInstance.getCredit({from: accounts[1], value: oneEth});
        let tokensConverted = await avaxInstance.checkCredit({from: accounts[1]});
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
        avaxInstance = await Avax.deployed();
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
            oneEth,
            "The amount of ether in Reserves contract is not correct."
        );
    });

    //3. Testing Reserves intialiseReserves function
    it('3. Testing Reserves Intialise Reserves function', async() => {
        await reservesInstance.initialiseReserves();
        let totalAvaxInReserves = await reservesInstance.getTotalAvaxHolding();
        totalAvaxInReserves = Number(totalAvaxInReserves);

        await assert.strictEqual(
            totalAvaxInReserves,
            1000,
            "The amount of Avax Tokens in Reserves contract is not correct."
        );
    });

    //4. Testing Reserves addAvaxToReserves and getTotalAvaxHolding function
    it('4. Testing Reserves Add Avax To Reserves and Get Total Avax Holding function', async() => {
        await reservesInstance.addAvaxToReserve(100, {from: accounts[1]});
        let totalAvaxInReserves = await reservesInstance.getTotalAvaxHolding();
        totalAvaxInReserves = Number(totalAvaxInReserves);

        await assert.strictEqual(
            totalAvaxInReserves,
            1100,
            "The amount of Avax Tokens in Reserves contract is not correct."
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

    //7. Testing Reserves withdrawAvax function
    it('7. Testing Reserves Withdraw Avax function', async() => {
        await reservesInstance.withdrawAvax(1100, {from: accounts[0]});
        let avaxLeftAfterWithdrawal = await reservesInstance.getTotalAvaxHolding();
        avaxLeftAfterWithdrawal = Number(avaxLeftAfterWithdrawal);

        await assert.strictEqual(
            AvaxLeftAfterWithdrawal,
            0,
            "The amount of Avax left in Reserves after withdrawal is not correct."
        );
    });

    //8. Testing Reserves withdrawAvax function (Expect to fail)
    it('8. Testing Reserves Withdraw Avax function (Expect to fail)', async() => {
        await truffleAssert.reverts(
            reservesInstance.withdrawAvax(100, {from: accounts[0]}),
            "Please ensure total Avax Reserve has enough amount!"
        );
    });
});

contract('Liquidity Pool', function(accounts) {
    before (async() => {
        avaxInstance = await Avax.deployed();
        reservesInstance = await Reserves.deployed();
        liquidityPoolInstance = await LiquidityPool.deployed();
    })
    console.log("Testing Liquidity Pool contract");

    //9. Testing LP Transfer Ether function 
    it('9. Transfer Ether to Liquidity Pool', async() => {
        let transferEth = await liquidityPoolInstance.transferEther({from: accounts[1], value: oneEth});
        truffleAssert.eventEmitted(transferEth, "Deposit");

        let amountDeposit = await liquidityPoolInstance.getEtherAmountLoan({from: accounts[1]});
        amountDeposit = Number(amountDeposit);

        await assert.strictEqual(
            amountDeposit,
            1,
            "The amount of ether deposited by lender is not equal to the amount of ether in LP Contract."
        );
    });

    //10. Testing LP Transfer Avax function 
    it('10. Transfer Avax to Liquidity Pool', async() => {
        await avaxInstance.getCredit({from: accounts[3], value: oneEth}); // oneEth = 100Avax
        let transferAvax = await liquidityPoolInstance.transferAvax(100, {from: accounts[3]});
        truffleAssert.eventEmitted(transferAvax, "Deposit");

        let amountOfAvaxDeposit = await liquidityPoolInstance.getAvaxAmountLoan({from: accounts[3]});
        amountOfAvaxDeposit = Number(amountOfAvaxDeposit);

        await assert.strictEqual(
            amountOfAvaxDeposit,
            100,
            "The amount of Avax deposited by lender is not equal to the amount of Avax in LP Contract."
        );
    });

    //11. 
    it('11. ', async() => {
        
    });
});