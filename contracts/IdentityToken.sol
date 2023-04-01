// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20.sol";

contract IdentityToken is ERC20 {
    address IdentityMarket;

    event IssueIT(address to);
    event CheckITBalance(uint256 balance);

    modifier ownerOnly() {
        require(msg.sender == owner, "Only contract owner can call these functions");
        _;
    }

    modifier identityMarketOnly() {
        require(msg.sender == IdentityMarket, "Only contract owner can call these functions");
        _;

    }

    function setIdentityMarket(address _identityMarket) public ownerOnly {
        IdentityMarket = _identityMarket; 
    } 

    function getIdentity() public identityMarketOnly {
        mint(msg.sender, 1);
        emit IssueIT(msg.sender);
    }

    function transferIdentity(address from, address to, uint256 amount) public identityMarketOnly {
        transferFrom(from, to, amount);
    }

    function checkITBalance(address _user) public view returns (uint256) {
        return balanceOf(_user);
    }
}