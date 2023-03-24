// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract WalletFeed {
    uint256 fakeWalletValue;
    uint256 fakeTransactionCount;

    // returns simulated value of wallet
    function getWalletValue() public view returns (uint256) {
        return fakeWalletValue;
    }

    function setWalletValue(uint256 walletValue) public {
        fakeWalletValue = walletValue;
    }

    // returns simulated transaction count
    function getTransactionCount() public view returns (uint256) {
        return fakeTransactionCount;
    }

    function setTransactionCount(uint256 txncount) public {
        fakeTransactionCount = txncount;
    }
}
