// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20.sol";
import "./Oraculum.sol";

contract EternumCoin is ERC20 {

    Oraculum oraculumInstance;
    // ERC20 erc20Instance;
    // address owner;

    event GetEC(address to, uint256 amount);
    event CheckECBalance(uint256 balance);

    constructor(Oraculum oraculumAddress) {
        // erc20Instance = new ERC20();
        oraculumInstance = oraculumAddress;
        owner = msg.sender;
    }

    function getEC() public payable {
        require(msg.value >= oraculumInstance.queryCurrentECValue() * 1E15, "Insufficient ETH needed to get 1 EC!");

        uint256 amount = msg.value / (oraculumInstance.queryCurrentECValue() * 1E15);
        mint(msg.sender, amount);

        emit GetEC(msg.sender, amount);
    }

    function checkECBalance(address sender) public returns(uint256) {
        uint256 balance = balanceOf(sender);

        emit CheckECBalance(balance);

        return balance;
    }

    function transferEC(address from, address to, uint256 amount) public {
        transferFrom(from, to, amount);
    }
}