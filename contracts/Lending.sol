// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./USDC.sol";
import "./LiquidityPool.sol";

contract Lending {
    USDC usdcTokenContract;
    LiquidityPool liquidtyPool;
    uint256 _maximumLendingPercentage = 8500; //85% of collateral
    uint256 _lendingFee = 500; //5% of total collateral
    uint256 _holdingCollateral = 0; 
    uint256 _loanAmount = 0;
    address _debtOwner = msg.sender;

    //Map addresss to collateral?
    mapping(uint256 => uint256) transaction;

     constructor(USDC usdcTokenAddress) {
        usdcTokenContract = usdcTokenAddress;
    }

    //Take collateral and give 85% 
    function borrow(uint256 depositCollateral) public {
        require(depositCollateral != 0, "Please put more collateral");
        _holdingCollateral = depositCollateral;
        //address walletBorrowing = msg.sender;
        address liqudityPool = liquidtyPool.getAddress();
        usdcTokenContract.transferFrom(msg.sender, address(this), depositCollateral); //Transfer borrower collateral to this contract
        //_loanAmount = (depositCollateral * _maximumLendingPercentage) / 10_000; //85% of collateral
        _loanAmount = calculatePercentage(depositCollateral, _maximumLendingPercentage); //85% of collateral
        usdcTokenContract.transferFrom(liqudityPool, address(this), _loanAmount); //Take assets from Liquidity Pool
        usdcTokenContract.transferFrom(address(this), msg.sender, _loanAmount);
    }

    function repay() public {
        //require only the person who loan it can pay back
        require(msg.sender == _debtOwner , "You don't own this debt!");
        usdcTokenContract.transferFrom(msg.sender, address(this), _holdingCollateral); 
        //uint256 lendingFeeToDeduct = (_holdingCollateral * lendingFee) / 10_000;
        uint256 lendingFeeToDeduct = calculatePercentage(_holdingCollateral, _lendingFee);
        usdcTokenContract.transferFrom(address(this), msg.sender, (_holdingCollateral - lendingFeeToDeduct)); 
    }

    //This function calculates Percentages
    //Used to calculate the amount of Loan that can be given and platform lendingFees
    //e.g 
    //Assume collateral = 100, desired percentage = 85%
    //function returns 85

    function calculatePercentage(uint256 collateralAmount, uint256 percentage) public pure returns (uint256) {
        return (collateralAmount * percentage) / 10_000;
    }

    function getHoldingCollateral() public view returns (uint256) {
        return _holdingCollateral;
    }

    function getLoanAmount() public view returns (uint256) {
        return _loanAmount;
    }

    //write withdraw function
    //figure out who owns the contract and how to send tokens back




    
}
