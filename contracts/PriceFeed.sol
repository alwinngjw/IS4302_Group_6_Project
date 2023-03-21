pragma solidity ^0.8.7;

contract PriceFeed {
    function getEthPriceFirst() public view returns (uint256) {
        return 1000;
    }
    function getEthPriceToLiquidate() public view returns (uint256) {
        return 850; //Simulation purpose
    }

    function getAvaxPriceFirst() public view returns (uint256) {
        return 100;
    }
    function getAvaxPriceToLiquidate() public view returns (uint256) {
        return 85;
    }
}