// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20.sol";

contract IdentityToken is ERC20 {

    event IssueIT(address to);
    event CheckITBalance(uint256 balance);

    constructor() {
        owner = msg.sender;
    }

    function getIdentity() public payable {
        mint(msg.sender, 1);
        emit IssueIT(msg.sender);
    }

    function transferIdentity(address from, address to, uint256 amount) public {
        transferFrom(from, to, amount);
    }

    function checkITBalance(address _user) public view returns (uint256) {
        return balanceOf(_user);
    }
}