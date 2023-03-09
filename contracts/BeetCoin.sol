// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20.sol";

contract BeetCoin {

    ERC20 erc20Instance;
    address owner;

    event GetBC(address to, uint256 amount);
    event CheckBCBalance(uint256 balance);

    constructor() public {
        erc20Instance = new ERC20();
        owner = msg.sender;
    }

    function getBC() public payable {
        require(msg.value >= 1E19, "At least 10.00 ETH is needed to get 1 BC!");

        uint256 amount = msg.value / 1E19;
        erc20Instance.mint(msg.sender, amount);

        emit GetBC(msg.sender, amount);
    }

    function checkBCBalance(address sender) public returns(uint256) {
        uint256 balance = erc20Instance.balanceOf(sender);

        emit CheckBCBalance(balance);

        return balance;
    }

    function transferBC(address from, address to, uint256 amount) public {
        erc20Instance.transferFrom(from, to, amount);
    }
}