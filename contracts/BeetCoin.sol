// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20.sol";
import "./Oraculum.sol";

contract BeetCoin is ERC20 {

    Oraculum oraculumInstance;
    // ERC20 erc20Instance;
    // address owner;

    event GetBC(address to, uint256 amount);
    event CheckBCBalance(uint256 balance);

    constructor(Oraculum oraculumAddress) {
        // erc20Instance = new ERC20();
        oraculumInstance = oraculumAddress;
        owner = msg.sender;
    }

    function getBC() public payable {
        require(msg.value >= oraculumInstance.queryCurrentBCValue() * 1E15, "Insufficient ETH needed to get 1 BC!");

        uint256 amount = msg.value / (oraculumInstance.queryCurrentBCValue() * 1E15);
        mint(msg.sender, amount);

        emit GetBC(msg.sender, amount);
    }

    function checkBCBalance(address sender) public returns(uint256) {
        uint256 balance = balanceOf(sender);

        emit CheckBCBalance(balance);

        return balance;
    }

    function transferBC(address from, address to, uint256 amount) public {
        transferFrom(from, to, amount);
    }
}