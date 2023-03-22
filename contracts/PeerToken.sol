// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20.sol";

contract PeerToken is ERC20 {

    // ERC20 erc20Instance;
    // address owner;

    event GetPT(address to, uint256 amount);
    event CheckPTBalance(uint256 balance);

    constructor() {
        // erc20Instance = new ERC20();
        owner = msg.sender;
    }

    function getPT() public payable {
        require(msg.value >= 1E15, "At least 0.001 ETH is needed to get 1 PT!");

        uint256 amount = msg.value / 1E15;
        mint(msg.sender, amount);

        emit GetPT(msg.sender, amount);
    }

    function checkPTBalance(address sender) public returns(uint256) {
        uint256 balance = balanceOf(sender);

        emit CheckPTBalance(balance);

        return balance;
    }

    function transferPT(address from, address to, uint256 amount) public {
        transferFrom(from, to, amount);
    }
}