// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20.sol";

contract SolarisCoin {

    ERC20 erc20Instance;
    address owner;

    event GetSC(address to, uint256 amount);
    event CheckSCBalance(uint256 balance);

    constructor() public {
        erc20Instance = new ERC20();
        owner = msg.sender;
    }

    function getSC() public payable {
        require(msg.value >= 1E16, "At least 0.01 ETH is needed to get 1 SC!");

        uint256 amount = msg.value / 1E16;
        erc20Instance.mint(msg.sender, amount);

        emit GetSC(msg.sender, amount);
    }

    function checkSCBalance(address sender) public returns(uint256) {
        uint256 balance = erc20Instance.balanceOf(sender);

        emit CheckSCBalance(balance);

        return balance;
    }

    function transferSC(address from, address to, uint256 amount) public {
        erc20Instance.transferFrom(from, to, amount);
    }
}