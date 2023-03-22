// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20.sol";
import "./Oraculum.sol";

contract SolarisCoin is ERC20 {

    Oraculum oraculumInstance;
    // ERC20 erc20Instance;
    // address owner;

    event GetSC(address to, uint256 amount);
    event CheckSCBalance(uint256 balance);

    constructor(Oraculum oraculumAddress) {
        // erc20Instance = new ERC20();
        oraculumInstance = oraculumAddress;
        owner = msg.sender;
    }

    function getSC() public payable {
        require(msg.value >= oraculumInstance.queryCurrentSCValue() * 1E15, "Insufficient ETH needed to get 1 SC!");

        uint256 amount = msg.value / (oraculumInstance.queryCurrentSCValue() * 1E15);
        mint(msg.sender, amount);

        emit GetSC(msg.sender, amount);
    }

    function checkSCBalance(address sender) public returns(uint256) {
        uint256 balance = balanceOf(sender);

        emit CheckSCBalance(balance);

        return balance;
    }

    function transferSC(address from, address to, uint256 amount) public {
        transferFrom(from, to, amount);
    }
}