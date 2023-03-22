// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20.sol";

contract IdentityToken is ERC20 {

    event IssueBC(address to);
    event CheckBCBalance(uint256 balance);

    constructor() {
        owner = msg.sender;
    }

    function getIdentity() public payable {
        mint(msg.sender, 1);
        emit IssueBC(msg.sender);
    }

    function transferIdentity(address from, address to, uint256 amount) public {
        transferFrom(from, to, amount);
    }

}