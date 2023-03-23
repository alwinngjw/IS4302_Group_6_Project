// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract PriceFeed {
    function getEthPriceFirst() public pure returns (uint256) {
        return 1000;
    }
    function getEthPriceToLiquidate() public pure returns (uint256) {
        return 850; //Simulation purpose
    }

    function getAvaxPriceFirst() public pure returns (uint256) {
        return 100;
    }
    function getAvaxPriceToLiquidate() public pure returns (uint256) {
        return 76;
    }
}