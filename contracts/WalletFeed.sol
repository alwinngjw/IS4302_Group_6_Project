pragma solidity ^0.8.7;

contract WalletFeed {
    uint256 fakeRandomNumber;

    // returns simulated value of wallet
    function getWalletValue() public view returns (uint256) {
        return fakeRandomNumber;
    }

    function setWalletValue(uint256 walletValue) public {
        fakeRandomNumber = walletValue;
    }

}