const _deploy_contracts = require("../migrations/3_deploy_peer_contracts");
const truffleAssert = require('truffle-assertions');
const BN = require('bn.js');

var assert = require('assert');
var ERC20 = artifacts.require("../contracts/ERC20.sol");
var BeetCoin = artifacts.require("../contracts/BeetCoin.sol");
var SolarisCoin = artifacts.require("../contracts/SolarisCoin.sol");
var PeerExchangeOrder = artifacts.require("../contracts/PeerExchangeOrder.sol");


/*
contract('PeerExchangeSystem', function(accounts) {
    before(async () => {
        erc20instance = await ERC20.deployed();
        beetCointInstance = await BeetCoin.deployed();
        solarisCoinInstance = await SolarisCoin.deployed();
        peerExchangeOrderInstance = await PeerExchangeOrder.deployed();
    });
    console.log("Test Peer System");

    // Test 1: Test Get BeetCoin
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

    // Test 2: Test Get SolarisCoin
    it('Test Get SolarisCoin', async() => {
        let getSC = await solarisCoinInstance.getSC({from: accounts[3], value: 1E19});
        await truffleAssert.eventEmitted(getSC, "GetSC");
        let checkSCBalance = await solarisCoinInstance.checkSCBalance.call(accounts[3]);

        assert.strictEqual(
            checkSCBalance.toNumber(),
            1000,
            "SolarisCoin Not Deployed Correctly"
        );
    });


    /*
    // Test 3: Test Cannot Create Order With Offered Amount == 0
    it('Test Cannot Create Order With No Offered Amount', async() => {
        let createOrder = await peerExchangeOrderInstance.createOrder(1, 0, 3, {from: accounts[1]});

        assert.notStrictEqual(
            createOrder,
            undefined,
            "Failed To Create Order"
        );
    });
    */
/*
    // Test 3: Test Cannot Create Order With Offered Amount == 0 
    it('Test Cannot Create Order With No Offered Amount', async() => {
        await truffleAssert.reverts(peerExchangeOrderInstance.createOrder(1, 0, 3, {from: accounts[1]}), "Invalid Offered Amount!");
    });

    /*
    // Test 4: Test Cannot Create Order With Insufficient Currency
    it('Test Cannot Create Order With Insufficient Currency', async() => {
        let createOrder = await peerExchangeOrderInstance.createOrder(1, 2, 3, {from: accounts[1]});

        assert.notStrictEqual(
            createOrder,
            undefined,
            "Failed To Create Order"
        );
    });
    */
/*
    // Test 4: Test Cannot Create Order With Insufficient Currency
    it('Test Cannot Create Order With Insufficient Currency', async() => {
        await truffleAssert.reverts(peerExchangeOrderInstance.createOrder(1, 2, 3, {from: accounts[1]}), "Insufficient Balance!");
    });

    /*
    // Test 5: Test Cannot Create Order With Same Offered And Requested Currency
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

    // Test 6: Test Create Order
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

    // Test 7: Test Only Owner Can Transfer Order
    it('Test Order Can Only Be Transferred By Owner', async() => {
        await truffleAssert.reverts(peerExchangeOrderInstance.transferOrder(peerExchangeOrderInstance.address, 0, {from: accounts[2]}));
    });

    // Test 8: Test Only Owner Can Cancel Order
    it('Test Order Can Be Only Be Cancelled By Owner', async() => {
        await truffleAssert.reverts(peerExchangeOrderInstance.cancelOrder(0, {from: accounts[2]}), "Not Current Owner!");
    });

    // Test 9: Test Cancel Order
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

    // Test 10: Test Transfer Order 
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

    // Test 11: Test Only Administrator Can Trigger Matching
    it('Test Only Admin Can Trigger Matching', async() => {
        await truffleAssert.reverts(peerExchangeOrderInstance.matchPair({from: accounts[1]}), "Only Administrator can trigger Matching!");
    });

    // Test 12: Test Matching Pair
    it('Test Matching Pair', async() => {
        let createOrder = await peerExchangeOrderInstance.createOrder(3, 1000, 1, {from: accounts[3]});
        await truffleAssert.eventEmitted(createOrder, "CreateOrder");
        let transferOrder = await peerExchangeOrderInstance.transferOrder(peerExchangeOrderInstance.address, 2, {from: accounts[3]});
        await truffleAssert.eventEmitted(transferOrder, "TransferOrder");
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
    })

});
*/