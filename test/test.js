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
        let totalEtherInReserves = await reservesInstance.getTotalEthCHolding();
        totalEtherInReserves = Number(totalEtherInReserves);

        await assert.strictEqual(
            totalEtherInReserves ,
            1,
            "The amount of ether in Reserves contract is not correct."
        );
    });

    //3. Testing Reserves intialiseReserves function
    it('3. Testing Reserves Intialise Reserves function', async() => {
        await reservesInstance.InitialiseReserves();
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
        await reservesInstance.withDrawEth(1, {from: accounts[0]});
        let EtherLeftAfterWithdrawal = await reservesInstance.getTotalEthCHolding();
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
            reservesInstance.withDrawEth(1, {from: accounts[0]}),
            "Please ensure totalETHCReserve has enough amount!"
        );
    });

    //7. Testing Reserves withdrawAvax function
    it('7. Testing Reserves Withdraw Avax function', async() => {
        await reservesInstance.withdrawAvax(1100, {from: accounts[0]});
        let avaxLeftAfterWithdrawal = await reservesInstance.getTotalAvaxHolding();
        avaxLeftAfterWithdrawal = Number(avaxLeftAfterWithdrawal);

        await assert.strictEqual(
            avaxLeftAfterWithdrawal,
            0,
            "The amount of Avax left in Reserves after withdrawal is not correct."
        );
    });

    //8. Testing Reserves withdrawAvax function (Expect to fail)
    it('8. Testing Reserves Withdraw Avax function (Expect to fail)', async() => {
        await truffleAssert.reverts(
            reservesInstance.withdrawAvax(100, {from: accounts[0]}),
            "Please ensure totalAvaxReserve has enough amount!"
        );
    });
});

contract('Liquidity Pool', function(accounts) {
    before (async() => {
        avaxInstance = await Avax.deployed();
        reservesInstance = await Reserves.deployed();
        liquidityPoolInstance = await LiquidityPool.deployed();
        priceFeedInstance = await PriceFeed.deployed();
        lendingInstance = await Lending.deployed();
    })
    console.log("Testing Liquidity Pool contract");

    //9. Testing LP Transfer Ether function 
    it('9. Transfer Ether to Liquidity Pool', async() => {
        let transferEth = await liquidityPoolInstance.transferEth({from: accounts[1], value: oneEth});
        truffleAssert.eventEmitted(transferEth, "Deposit");

        let amountDeposit = await liquidityPoolInstance.getEthAmountLoan({from: accounts[1]});
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

    //11. Testing LP Withdraw All Avax Function (If statement)
    it('11. Withdraw All Avax (If statement)', async() => {
        await reservesInstance.InitialiseReserves(); //Initialise reserves to have 1000Avax as withdraw all for the previous tests
        await avaxInstance.getCredit({from: accounts[2], value: oneEth}); // oneEth = 100Avax
        await liquidityPoolInstance.transferAvax(100, {from: accounts[2]}); //LP Avax = 200Avax

        let withdrawAvax = await liquidityPoolInstance.withDrawAllAvax({from:accounts[2]}); //withdraw 100Avax
        truffleAssert.eventEmitted(withdrawAvax, "withDrawingFromReserves");
        
        let senderAvaxBalance = await avaxInstance.checkCredit({from:accounts[2]}); //103Avax (including yield)
        let lpAvaxBalance = await liquidityPoolInstance.getAvaxTvl(); //200 + 103 - 103 = 200Avax
        let reservesAvaxBalance = await reservesInstance.getTotalAvaxHolding(); // 1000 - 103 = 897Avax

        senderAvaxBalance = Number(senderAvaxBalance);
        lpAvaxBalance = Number(lpAvaxBalance);
        reservesAvaxBalance = Number(reservesAvaxBalance);

        await assert.strictEqual(
            senderAvaxBalance, 
            103,
            "Incorrect avax amount received by lender after withdrawing all avax from Liquidity Pool."
        )

        await assert.strictEqual(
            lpAvaxBalance, 
            200,
            "Incorrect avax amount left in Liquidity Pool after lender withdrew all avax."
        )

        await assert.strictEqual(
            reservesAvaxBalance, 
            897,
            "Incorrect avax amount left in Reserves after lender withdrew all avax."
        )
    });

    //12. Testing LP Send Avax to Lending Contract 
    it('12. Transfer Avax from LP to Lending Contract', async() => {
        //Transfer 100Avax to Lending Contract
        await liquidityPoolInstance.sendAvaxToLendingContract(100, await lendingInstance.getAddress()); //200 - 100 = 100Avax
        let avaxBalanceInLP = await liquidityPoolInstance.getAvaxTvl();
        avaxBalanceInLP  = Number(avaxBalanceInLP );

        await assert.strictEqual(
            avaxBalanceInLP ,
            100,
            "Avax balance in Liquidity Pool after transfer is incorrect."
        )
    });
    

    //13. Testing LP Withdraw All Avax Function (Else statement)
    it('13. Withdraw All Avax (Else statement)', async() => {
        let withdrawAvax = await liquidityPoolInstance.withDrawAllAvax({from:accounts[3]}); //withdraw 100Avax
        truffleAssert.eventEmitted(withdrawAvax, "Withdraw");
        
        let senderAvaxBalance = await avaxInstance.checkCredit({from:accounts[3]}); //103Avax (including yield)
        let lpAvaxBalance = await liquidityPoolInstance.getAvaxTvl(); //100 + 3 - 103 = 0Avax
        let reservesAvaxBalance = await reservesInstance.getTotalAvaxHolding(); // 897 - 3 = 894Avax

        senderAvaxBalance = Number(senderAvaxBalance);
        lpAvaxBalance = Number(lpAvaxBalance);
        reservesAvaxBalance = Number(reservesAvaxBalance);

        await assert.strictEqual(
            senderAvaxBalance, 
            103,
            "Incorrect avax amount received by lender after withdrawing all avax from Liquidity Pool."
        )

        await assert.strictEqual(
            lpAvaxBalance, 
            0,
            "Incorrect avax amount left in Liquidity Pool after lender withdrew all avax."
        )

        await assert.strictEqual(
            reservesAvaxBalance, 
            894,
            "Incorrect avax amount left in Reserves after lender withdrew all avax."
        )
    });

    //14. Testing LP Send Ether to Lender Function 
    it('14. Testing LP Send Ether to Lender Function', async() => {
        await liquidityPoolInstance.sendEthToLender(oneEth, accounts[2]);
        let remainingEthInLP = await liquidityPoolInstance.getEthTvl();
        remainingEthInLP = Number(remainingEthInLP);

        await assert.strictEqual(
            0,
            remainingEthInLP,
            "Remaining Ether in Liquidity Pool is incorrect."
        )
    });
});
*/