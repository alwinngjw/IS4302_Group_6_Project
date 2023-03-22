const _deploy_contracts = require("../migrations/3_deploy_peer_contracts");
const truffleAssert = require('truffle-assertions');
const BN = require('bn.js');

var assert = require('assert');
var ERC20 = artifacts.require("../contracts/ERC20.sol");
var Oraculum = artifacts.require("../contracts/Oraculum.sol");
var BeetCoin = artifacts.require("../contracts/BeetCoin.sol");
var EternumCoin = artifacts.require("../contracts/EternumCoin.sol");
var SolarisCoin = artifacts.require("../contracts/SolarisCoin.sol");
var PeerToken = artifacts.require("./contracts/PeerToken.sol")
var PeerExchangeOrder = artifacts.require("../contracts/PeerExchangeOrder.sol");


contract('PeerExchangeSystem', function(accounts) {
    before(async () => {
        erc20instance = await ERC20.deployed();
        oraculumInstance = await Oraculum.deployed();
        beetCointInstance = await BeetCoin.deployed();
        eternumCoinInstance = await EternumCoin.deployed();
        solarisCoinInstance = await SolarisCoin.deployed();
        peerTokenInstance = await PeerToken.deployed();
        peerExchangeOrderInstance = await PeerExchangeOrder.deployed();
    });
    console.log("Test Peer System");

    // Test 1: Test Oraculum Querying Works
    it('Test Oraculum', async() => {
        let valueBC = await oraculumInstance.queryCurrentBCValue();
        let valueEC = await oraculumInstance.queryCurrentECValue();
        let valueSC = await oraculumInstance.queryCurrentSCValue();

        assert.strictEqual(
            valueBC.toNumber(),
            10000,
            "Oraculum Not Deployed Correctly"
        );

        assert.strictEqual(
            valueEC.toNumber(),
            1000,
            "Oraculum Not Deployed Correctly"
        );

        assert.strictEqual(
            valueSC.toNumber(),
            10,
            "Oraculum Not Deployed Correctly"
        );
    });

    // Test 2: Test Get PeerToken
    it('Test Get PeerToken', async() => {
        let getPT1 = await peerTokenInstance.getPT({from: accounts[1], value: 1E15});
        await truffleAssert.eventEmitted(getPT1, "GetPT");
        let checkPTBalance1 = await peerTokenInstance.checkPTBalance.call(accounts[1]);

        assert.strictEqual(
            checkPTBalance1.toNumber(),
            1,
            "PeerToken Not Deployed Correctly"
        );

        let getPT2 = await peerTokenInstance.getPT({from: accounts[2], value: 1E15});
        await truffleAssert.eventEmitted(getPT2, "GetPT");
        let checkPTBalance2 = await peerTokenInstance.checkPTBalance.call(accounts[2]);

        assert.strictEqual(
            checkPTBalance2.toNumber(),
            1,
            "PeerToken Not Deployed Correctly"
        );

        let getPT3 = await peerTokenInstance.getPT({from: accounts[3], value: 1E15});
        await truffleAssert.eventEmitted(getPT3, "GetPT");
        let checkPTBalance3 = await peerTokenInstance.checkPTBalance.call(accounts[3]);

        assert.strictEqual(
            checkPTBalance3.toNumber(),
            1,
            "PeerToken Not Deployed Correctly"
        );

        let getPT4 = await peerTokenInstance.getPT({from: accounts[4], value: 1E15});
        await truffleAssert.eventEmitted(getPT4, "GetPT");
        let checkPTBalance4 = await peerTokenInstance.checkPTBalance.call(accounts[4]);

        assert.strictEqual(
            checkPTBalance4.toNumber(),
            1,
            "PeerToken Not Deployed Correctly"
        );

        let getPT5 = await peerTokenInstance.getPT({from: accounts[5], value: 1E15});
        await truffleAssert.eventEmitted(getPT5, "GetPT");
        let checkPTBalance5 = await peerTokenInstance.checkPTBalance.call(accounts[5]);

        assert.strictEqual(
            checkPTBalance5.toNumber(),
            1,
            "PeerToken Not Deployed Correctly"
        );

        let getPT6 = await peerTokenInstance.getPT({from: accounts[6], value: 1E15});
        await truffleAssert.eventEmitted(getPT6, "GetPT");
        let checkPTBalance6 = await peerTokenInstance.checkPTBalance.call(accounts[6]);

        assert.strictEqual(
            checkPTBalance6.toNumber(),
            1,
            "PeerToken Not Deployed Correctly"
        );
    });

    // Test 3: Test Get BeetCoin
    it('Test Get BeetCoin', async() => {
        let getBC = await beetCointInstance.getBC({from: accounts[1], value: 1E19});
        await truffleAssert.eventEmitted(getBC, "GetBC");
        let checkBCBalance = await beetCointInstance.checkBCBalance.call(accounts[1]);

        assert.strictEqual(
            checkBCBalance.toNumber(),
            1,
            "BeetCoin Not Deployed Correctly"
        );
    });

    // Test 4: Test Get EternumCoin
    it('Test Get EternumCoin', async() => {
        let getEC = await eternumCoinInstance.getEC({from: accounts[2], value: 1E18});
        await truffleAssert.eventEmitted(getEC, "GetEC");
        let checkECBalance = await eternumCoinInstance.checkECBalance.call(accounts[2]);

        assert.strictEqual(
            checkECBalance.toNumber(),
            1,
            "EternumCoin Not Deployed Correctly"
        );
    });

    // Test 5: Test Get SolarisCoin
    it('Test Get SolarisCoin', async() => {
        let getSC3 = await solarisCoinInstance.getSC({from: accounts[3], value: 1E19});
        await truffleAssert.eventEmitted(getSC3, "GetSC");
        let checkSCBalance3 = await solarisCoinInstance.checkSCBalance.call(accounts[3]);

        assert.strictEqual(
            checkSCBalance3.toNumber(),
            1000,
            "SolarisCoin Not Deployed Correctly"
        );

        let getSC4 = await solarisCoinInstance.getSC({from: accounts[4], value: 1E18});
        await truffleAssert.eventEmitted(getSC4, "GetSC");
        let checkSCBalance4 = await solarisCoinInstance.checkSCBalance.call(accounts[4]);

        assert.strictEqual(
            checkSCBalance4.toNumber(),
            100,
            "SolarisCoin Not Deployed Correctly"
        );
    });


    /*
    // Test 6: Test Cannot Create Order With Offered Amount == 0
    it('Test Cannot Create Order With No Offered Amount', async() => {
        let createOrder = await peerExchangeOrderInstance.createOrder(1, 0, 3, {from: accounts[1]});

        assert.notStrictEqual(
            createOrder,
            undefined,
            "Failed To Create Order"
        );
    });
    */
    // Test 3: Test Cannot Create Order With Offered Amount == 0 
    it('Test Cannot Create Order With No Offered Amount', async() => {
        await truffleAssert.reverts(peerExchangeOrderInstance.createOrder(1, 0, 3, {from: accounts[1]}), "Invalid Offered Amount!");
    });

    /*
    // Test 7: Test Cannot Create Order With Insufficient Currency
    it('Test Cannot Create Order With Insufficient Currency', async() => {
        let createOrder = await peerExchangeOrderInstance.createOrder(1, 2, 3, {from: accounts[1]});

        assert.notStrictEqual(
            createOrder,
            undefined,
            "Failed To Create Order"
        );
    });
    */

    // Test 7: Test Cannot Create Order With Insufficient Currency
    it('Test Cannot Create Order With Insufficient Currency', async() => {
        await truffleAssert.reverts(peerExchangeOrderInstance.createOrder(1, 2, 3, {from: accounts[1]}), "Insufficient Balance!");
    });

    /*
    // Test 8: Test Cannot Create Order With Same Offered And Requested Currency
    it('Test Cannot Create Order With Same Offered And Requested Currency', async() => {
        let createOrder = await peerExchangeOrderInstance.createOrder(3, 100, 3, {from: accounts[3]});

        assert.notStrictEqual(
            createOrder,
            undefined,
            "Failed To Create Order"
        );
    });
*/
    /*
    // Test 5: Test Cannot Create Order With Same Offered And Requested Currency
    it('Test Cannot Create Order With Same Offered And Requested Currency', async() => {
        await truffleAssert.reverts(peerExchangeOrderInstance.createOrder(3, 100, 3, {from: accounts[3]}), "Offered Currency cannot be the same as Requested Currency!");
    });
    */

    // Test 9: Test Create Order
    it('Test Order Can Be Created', async() => {
        let createOrder = await peerExchangeOrderInstance.createOrder(1, 1, 3, {from: accounts[1]});
        await truffleAssert.eventEmitted(createOrder, "CreateOrder");
        let checkBCBalance2 = await beetCointInstance.checkBCBalance.call(accounts[1]);

        assert.strictEqual(
            checkBCBalance2.toNumber(),
            0,
            "Failed To Create Order"
        );
    });

    // Test 10: Test Only Owner Can Transfer Order
    it('Test Order Can Only Be Transferred By Owner', async() => {
        await truffleAssert.reverts(peerExchangeOrderInstance.transferOrder(peerExchangeOrderInstance.address, 0, {from: accounts[2]}));
    });

    // Test 11: Test Only Owner Can Cancel Order
    it('Test Order Can Be Only Be Cancelled By Owner', async() => {
        await truffleAssert.reverts(peerExchangeOrderInstance.cancelOrder(0, {from: accounts[2]}), "Not Current Owner!");
    });

    // Test 12: Test Cancel Order
    it('Test Order Can Be Cancelled', async() => {
        let cancelOrder = await peerExchangeOrderInstance.cancelOrder(0, {from: accounts[1]});
        await truffleAssert.eventEmitted(cancelOrder, "CancelOrder");
        let checkBCBalance = await beetCointInstance.checkBCBalance.call(accounts[1]); 

        assert.strictEqual(
            checkBCBalance.toNumber(),
            1,
            "Failed To Cancel Order"
        );
    });

    // Test 13: Test Transfer Order 
    it('Test Order Can Be Transferred', async() => {
        let createOrder = await peerExchangeOrderInstance.createOrder(1, 1, 3, {from: accounts[1]});
        await truffleAssert.eventEmitted(createOrder, "CreateOrder");
        let transferOrder = await peerExchangeOrderInstance.transferOrder(peerExchangeOrderInstance.address, 1, {from: accounts[1]});
        await truffleAssert.eventEmitted(transferOrder, "TransferOrder");
        const newOwner = await peerExchangeOrderInstance.getCurrentOwner(1);

        assert.strictEqual(
            newOwner,
            peerExchangeOrderInstance.address,
            "Failed To Transfer Order"
        );
    });

    // Test 14: Test Only Administrator Can Trigger Matching
    it('Test Only Admin Can Trigger Matching', async() => {
        await truffleAssert.reverts(peerExchangeOrderInstance.matchPair({from: accounts[1]}), "Only Administrator can trigger Matching!");
    });

    // Test 15: Test Matching Pair
    it('Test Matching Pair', async() => {
        let createOrder3 = await peerExchangeOrderInstance.createOrder(3, 1000, 1, {from: accounts[3]});
        await truffleAssert.eventEmitted(createOrder3, "CreateOrder");
        let transferOrder3 = await peerExchangeOrderInstance.transferOrder(peerExchangeOrderInstance.address, 2, {from: accounts[3]});
        await truffleAssert.eventEmitted(transferOrder3, "TransferOrder");

        let createOrder2 = await peerExchangeOrderInstance.createOrder(2, 1, 3, {from: accounts[2]});
        await truffleAssert.eventEmitted(createOrder2, "CreateOrder");
        let transferOrder2 = await peerExchangeOrderInstance.transferOrder(peerExchangeOrderInstance.address, 3, {from: accounts[2]});
        await truffleAssert.eventEmitted(transferOrder2, "TransferOrder");

        let createOrder4 = await peerExchangeOrderInstance.createOrder(3, 100, 2, {from: accounts[4]});
        await truffleAssert.eventEmitted(createOrder4, "CreateOrder");
        let transferOrder4 = await peerExchangeOrderInstance.transferOrder(peerExchangeOrderInstance.address, 4, {from: accounts[4]});
        await truffleAssert.eventEmitted(transferOrder4, "TransferOrder");
        
        
        let matchPair = await peerExchangeOrderInstance.matchPair({from: accounts[0]});
        await truffleAssert.eventEmitted(matchPair, "Matched");

        let balance1 = await solarisCoinInstance.checkSCBalance.call(accounts[1]);

        assert.strictEqual(
            balance1.toNumber(),
            1000,
            "SolarisCoin Not Transferred Correctly"
        );

        let balance3 = await beetCointInstance.checkBCBalance.call(accounts[3]);

        assert.strictEqual(
            balance3.toNumber(),
            1,
            "BeetCoin Not Transferred Correctly"
        );

        let balance2 = await solarisCoinInstance.checkSCBalance.call(accounts[2]);

        assert.strictEqual(
            balance2.toNumber(),
            100,
            "SolarisCoin Not Transferred Correctly"
        );

        let balance4 = await eternumCoinInstance.checkECBalance.call(accounts[4]);

        assert.strictEqual(
            balance4.toNumber(),
            1,
            "EternumCoin Not Transferred Correctly"
        );
    });

    // Test 16: Test Commission Fee Deducted
    it('Test Commission Fee Deducted', async() => {
        let balancePlatform = await peerTokenInstance.checkPTBalance.call(peerExchangeOrderInstance.address);

        assert.strictEqual(
            balancePlatform.toNumber(),
            4,
            "Commission Fee Not Deducted Correctly"
        );
    });

    // Test 17: Test Oraculum Updated Value
    it('Test Oraculum Updated Value', async() => {
        let newValuation = await oraculumInstance.queryNewValuations();
        await truffleAssert.eventEmitted(newValuation, "NewValuation");
        
        let valueBC = await oraculumInstance.queryCurrentBCValue();
        let valueEC = await oraculumInstance.queryCurrentECValue();
        let valueSC = await oraculumInstance.queryCurrentSCValue();

        assert.strictEqual(
            valueBC.toNumber(),
            15000,
            "Oraculum Not Updated Correctly"
        );

        assert.strictEqual(
            valueEC.toNumber(),
            1000,
            "Oraculum Not Updated Correctly"
        );

        assert.strictEqual(
            valueSC.toNumber(),
            5,
            "Oraculum Not Updated Correctly"
        );
    });

    // Test 18: Test Cannot Get BeetCoin With Old Valuation
    it('Test Cannot Get BeetCoin With Old Valuation', async() => {
        await truffleAssert.reverts(beetCointInstance.getBC({from: accounts[5], value: 1E19}), "Insufficient ETH needed to get 1 BC!");
    });

    // Test 19: Test Can Get More SolarisCoin With Old Valuation
    it('Test Can Get More SolarisCoin With Old Valuation', async() => {
        let getSC6 = await solarisCoinInstance.getSC({from: accounts[6], value: 1E19});
        await truffleAssert.eventEmitted(getSC6, "GetSC");
        let checkSCBalance6 = await solarisCoinInstance.checkSCBalance.call(accounts[6]);

        assert.strictEqual(
            checkSCBalance6.toNumber(),
            2000,
            "SolarisCoin Not Deployed Correctly"
        );
    });

    // Test 20: Test Matching Pair With New Valuation
    it('Test Matching Pair With New Valuation', async() => {
        let getBC = await beetCointInstance.getBC({from: accounts[5], value: 3E19});
        await truffleAssert.eventEmitted(getBC, "GetBC");

        let getSC = await solarisCoinInstance.getSC({from: accounts[6], value: 2E19});
        await truffleAssert.eventEmitted(getSC, "GetSC");

        let createOrder5 = await peerExchangeOrderInstance.createOrder(1, 2, 3, {from: accounts[5]});
        await truffleAssert.eventEmitted(createOrder5, "CreateOrder");
        let transferOrder5 = await peerExchangeOrderInstance.transferOrder(peerExchangeOrderInstance.address, 5, {from: accounts[5]});
        await truffleAssert.eventEmitted(transferOrder5, "TransferOrder");

        let createOrder6 = await peerExchangeOrderInstance.createOrder(3, 6000, 1, {from: accounts[6]});
        await truffleAssert.eventEmitted(createOrder6, "CreateOrder");
        let transferOrder6 = await peerExchangeOrderInstance.transferOrder(peerExchangeOrderInstance.address, 6, {from: accounts[6]});
        await truffleAssert.eventEmitted(transferOrder6, "TransferOrder");

        let matchPair = await peerExchangeOrderInstance.matchPair({from: accounts[0]});
        await truffleAssert.eventEmitted(matchPair, "Matched");

        let balance5 = await solarisCoinInstance.checkSCBalance.call(accounts[5]);

        assert.strictEqual(
            balance5.toNumber(),
            6000,
            "SolarisCoin Not Transferred Correctly"
        );

        let balance6 = await beetCointInstance.checkBCBalance.call(accounts[6]);

        assert.strictEqual(
            balance6.toNumber(),
            2,
            "BeetCoin Not Transferred Correctly"
        );
    });
});