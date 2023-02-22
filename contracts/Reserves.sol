pragma solidity ^0.8.7;
import "./USDC.sol";
import "./LiquidityPool.sol";

contract Reserves {

    USDC usdcToken;
    LiquidityPool liquidityPool;
    uint256 totalEthReserve;
    uint256 totalUSDCReserve;


    constructor(USDC usdcTokenAddress, LiquidityPool liquidityPoolAddress) {
        usdcToken = usdcTokenAddress;
        liquidityPool = liquidityPoolAddress;
        totalEthReserve = 1000;
        totalUSDCReserve = 1000;
    }

    function addEthToReserve(uint256 amount) public payable {
        totalEthReserve += amount;
    }

    function addUSDCToReserve(uint256 amount) public payable {
        totalUSDCReserve += amount;
    }

    function withdrawEth (uint256 amount) public returns (uint256) {
        require(totalEthReserve >= amount, "Please ensure totalEthReserve has enough amount!");
        totalEthReserve -= amount;
        return amount;
    }

    function withdrawUSDC(uint256 amount) public returns (uint256) {
        require(totalUSDCReserve >= amount, "Please ensure totalUSDCReserve has enough amount!");
        totalUSDCReserve -= amount;
        return amount;
    }
}
