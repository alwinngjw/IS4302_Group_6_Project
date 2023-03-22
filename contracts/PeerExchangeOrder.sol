// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20.sol";
import "./BeetCoin.sol";
import "./EternumCoin.sol";
import "./SolarisCoin.sol";
import "./PeerToken.sol";
import "./Oraculum.sol";

contract PeerExchangeOrder {

    ERC20 erc20Instance;
    BeetCoin beetCoinInstance;
    EternumCoin eternumCoinInstance;
    SolarisCoin solarisCoinInstance;
    PeerToken peerTokenInstance;
    Oraculum oraculumInstance;

    address administrator;
    uint256 commissionFee;
    uint256 public numOrders = 0;
    mapping(uint256 => order) public orders;
    
    // Currency: 1 - BeetCoin, 2 - EternumCoin, 3 - SolarisCoin
    order[] exchange1for2;
    order[] exchange1for3;
    order[] exchange2for1;
    order[] exchange2for3;
    order[] exchange3for1;
    order[] exchange3for2;

    constructor(ERC20 erc20Address, BeetCoin beetCoinAddress, EternumCoin eternumCoinAddress, 
        SolarisCoin solarisCoinAddress, PeerToken peerTokenAddress, Oraculum oraculumAddress) public {
        erc20Instance = erc20Address;
        beetCoinInstance = beetCoinAddress;
        eternumCoinInstance = eternumCoinAddress;
        solarisCoinInstance = solarisCoinAddress;
        peerTokenInstance = peerTokenAddress;
        oraculumInstance = oraculumAddress;
        administrator = msg.sender;
        commissionFee = 1;      // 1 PT
    }

    struct order {
        address currentOwner;
        address previousOwner;
        uint8 offeredCurrency;
        uint256 offeredAmount;
        uint8 requestedCurrency;
        uint256 requestedAmount;
    }

    event CreateOrder(uint256 orderId);
    event TransferCurrency(address to, uint256 amount);
    event TransferOrder(address to, uint256 orderId);
    event CancelOrder();
    event Matched(address peer1, address peer2);

    modifier ownerOnly(uint256 orderId) {
        require(orders[orderId].currentOwner == msg.sender, "Not Current Owner!");
        _;
    }

    modifier previousOwnerOnly(uint256 orderId) {
        require(orders[orderId].previousOwner == msg.sender, "Not Previous Owner!");
        _;
    }

    modifier validOrderId(uint256 orderId) {
        require(orderId < numOrders, "Invalid Order Id");
        _;
    }

    function createOrder(uint8 offeredCurrency, uint256 offeredAmount, uint8 requestedCurrency) public returns (uint256) {
        require(offeredCurrency > 0 && offeredCurrency < 4, "Invalid Offered Currency!");
        require(requestedCurrency > 0 && requestedCurrency < 4, "Invalid Requested Currency!");
        require(offeredCurrency != requestedCurrency, "Offered Currency cannot be the same as Requested Currency!");
        require(offeredAmount > 0, "Invalid Offered Amount!");

        uint256 requestedAmount = 0;
        if (offeredCurrency == 1) {
            require(offeredAmount <= beetCoinInstance.checkBCBalance(msg.sender), "Insufficient Balance!");

            beetCoinInstance.transferBC(msg.sender, address(this), offeredAmount);
            if (requestedCurrency == 2) {
                requestedAmount = offeredAmount * oraculumInstance.ratioBCEC();
            } else {    // requestedCurrency == 3
                requestedAmount = offeredAmount * oraculumInstance.ratioBCSC();
            }
        } else if (offeredCurrency == 2) {
            require(offeredAmount <= eternumCoinInstance.balanceOf(msg.sender), "Insufficient Balance!");

            eternumCoinInstance.transferEC(msg.sender, address(this), offeredAmount);
            if (requestedCurrency == 1) {
                requestedAmount = offeredAmount / oraculumInstance.ratioBCEC();
            } else {    // requestedCurrency == 3
                requestedAmount = offeredAmount * oraculumInstance.ratioECSC();
            }
        } else {        // offeredCurrency == 3
            require(offeredAmount <= solarisCoinInstance.checkSCBalance(msg.sender), "Insufficient Balance!");

            solarisCoinInstance.transferSC(msg.sender, address(this), offeredAmount);
            if (requestedCurrency == 1) {
                requestedAmount = offeredAmount / oraculumInstance.ratioBCSC();
            } else {    // requestedCurrency == 2
                requestedAmount = offeredAmount / oraculumInstance.ratioECSC();
            }
        }

        order memory newOrder = order(msg.sender, address(0), offeredCurrency, offeredAmount, requestedCurrency, requestedAmount);
        uint256 orderId = numOrders++;
        orders[orderId] = newOrder;

        emit TransferCurrency(address(this), offeredAmount);
        emit CreateOrder(orderId);

        return orderId;
    }

    function transferOrder(address to, uint256 orderId) public ownerOnly(orderId) validOrderId(orderId) {
        orders[orderId].previousOwner = orders[orderId].currentOwner;
        orders[orderId].currentOwner = to;
        
        if (orders[orderId].offeredCurrency == 1) {
            if (orders[orderId].requestedCurrency == 2) {
                exchange1for2.push(orders[orderId]);
            } else {        // Requested Currency == 3
                exchange1for3.push(orders[orderId]);
            }
        } else if (orders[orderId].offeredCurrency == 2) {
            if (orders[orderId].requestedCurrency == 1) {
                exchange2for1.push(orders[orderId]);
            } else {        // Requested Currency == 3
                exchange2for3.push(orders[orderId]);
            }
        } else {            // Offered Currency == 3
            if (orders[orderId].requestedCurrency == 1) {
                exchange3for1.push(orders[orderId]);
            } else {        // Requested Currency == 2
                exchange3for2.push(orders[orderId]);
            }
        }

        emit TransferOrder(to, orderId);
    }

    function cancelOrder(uint256 orderId) public ownerOnly(orderId) validOrderId(orderId) {
        uint8 currency = orders[orderId].offeredCurrency;
        uint256 amount = orders[orderId].offeredAmount;
        delete orders[orderId];

        if (currency == 1) {
            beetCoinInstance.transferBC(address(this), msg.sender, amount);
        } else if (currency == 2) {
            eternumCoinInstance.transferEC(address(this), msg.sender, amount);
        } else {        // Currency == 3
            solarisCoinInstance.transferSC(address(this), msg.sender, amount);
        }

        emit CancelOrder();
        emit TransferCurrency(msg.sender, amount);
    }

    function matchPair() public {
        require(msg.sender == administrator, "Only Administrator can trigger Matching!");
        
        // Matching 1 & 2
        for (uint i = 0; i < exchange1for2.length; i++) {
            for (uint j = 0; j < exchange2for1.length; j++) {
                if (exchange1for2[i].offeredAmount == exchange2for1[j].requestedAmount) {
                    beetCoinInstance.transferBC(address(this), exchange2for1[j].previousOwner, exchange2for1[j].requestedAmount);
                    eternumCoinInstance.transferEC(address(this), exchange1for2[i].previousOwner, exchange1for2[i].requestedAmount);
                    
                    // Deduction of CommissionFee
                    peerTokenInstance.transferFrom(exchange1for2[i].previousOwner, address(this), commissionFee);
                    peerTokenInstance.transferFrom(exchange2for1[j].previousOwner, address(this), commissionFee);
                    
                    emit Matched(exchange1for2[i].previousOwner, exchange2for1[j].previousOwner);

                    // Marking Order As Completed 
                    exchange1for2[i].requestedAmount = 0;
                    exchange2for1[j].requestedAmount = 0;
                }
            }
        }

        // Matching 1 & 3
        for (uint i = 0; i < exchange1for3.length; i++) {
            for (uint j = 0; j < exchange3for1.length; j++) {
                if (exchange1for3[i].offeredAmount == exchange3for1[j].requestedAmount) {
                    beetCoinInstance.transferBC(address(this), exchange3for1[j].previousOwner, exchange3for1[j].requestedAmount);
                    solarisCoinInstance.transferSC(address(this), exchange1for3[i].previousOwner, exchange1for3[i].requestedAmount);
                    
                    // Deduction of CommissionFee
                    peerTokenInstance.transferFrom(exchange1for3[i].previousOwner, address(this), commissionFee);
                    peerTokenInstance.transferFrom(exchange3for1[j].previousOwner, address(this), commissionFee);

                    emit Matched(exchange1for3[i].previousOwner, exchange3for1[j].previousOwner);

                    // Marking Order As Completed 
                    exchange1for3[i].requestedAmount = 0;
                    exchange3for1[j].requestedAmount = 0;
                }
            }
        }

        // Matching 2 & 3
        for (uint i = 0; i < exchange2for3.length; i++) {
            for (uint j = 0; j < exchange3for2.length; j++) {
                if (exchange2for3[i].offeredAmount == exchange3for2[j].requestedAmount) {
                    eternumCoinInstance.transferEC(address(this), exchange3for2[j].previousOwner, exchange3for2[j].requestedAmount);
                    solarisCoinInstance.transferSC(address(this), exchange2for3[i].previousOwner, exchange2for3[i].requestedAmount);
                    
                    // Deduction of CommissionFee
                    peerTokenInstance.transferFrom(exchange2for3[i].previousOwner, address(this), commissionFee);
                    peerTokenInstance.transferFrom(exchange3for2[j].previousOwner, address(this), commissionFee);

                    emit Matched(exchange2for3[i].previousOwner, exchange3for2[j].previousOwner);

                    // Marking Order As Completed 
                    exchange2for3[i].requestedAmount = 0;
                    exchange3for2[j].requestedAmount = 0;
                }
            }
        }
    }

    /* Get Methods For Testing */

    function getCurrentOwner(uint256 orderId) public view validOrderId(orderId) returns (address) {
        return orders[orderId].currentOwner;
    }

    function getPreviousOwner(uint256 orderId) public view validOrderId(orderId) returns (address) {
        return orders[orderId].previousOwner;
    }
}