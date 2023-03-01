// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./ERC20.sol";

//Assume 1 ether = 2000 USD
//1 ether should be 2000 USDC

contract USDC is ERC20 {
    uint256 supplyLimit;
    uint256 currentSupply;
    //address owner;

    constructor() public {
        owner = msg.sender;
        supplyLimit = 1000000;
    }

    function getCredit() public payable {
        uint256 amt = msg.value / 10000000000000000; //1eth = 100 tokens
        require(totalSupply() + amt < supplyLimit, "Token Supply is not enough");
        mint(msg.sender, amt);
    }
    function checkCredit() public view returns (uint256) {
        return balanceOf(msg.sender);
    }
}