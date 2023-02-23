// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./USDC.sol";
import "./LiquidityPool.sol";
import "./ERC20.sol";
import "./Reserves.sol";

contract Lending {
    USDC usdcToken;
    LiquidityPool liquidtyPool;
    Reserves reserves;
    uint256 _maximumLendingPercentage = 8500; //85% of collateral
    uint256 _lendingFee = 500; //5% of total collateral
    //uint256 _holdingCollateral = 0; 
    //uint256 _loanAmount = 0;
    address _debtOwner = msg.sender;

    //Map addresss to collateral?
    mapping(address => uint256) USDCCollateralLedger;
    mapping(address => uint256) USDCLoanLedger;

     constructor(USDC usdcTokenAddress, LiquidityPool lp, Reserves reservesAddress) {
        usdcToken = usdcTokenAddress;
        liquidtyPool = lp;
        reserves = reservesAddress;
    }

    //Take collateral and give 85% 
    function borrowUSDC(uint256 depositCollateral) public {
        require(depositCollateral != 0, "Please put more collateral");
        uint256 _loanAmount = calculatePercentage(depositCollateral, _maximumLendingPercentage); //85% of collateral
        USDCCollateralLedger[msg.sender] = depositCollateral;
        USDCLoanLedger[msg.sender] = _loanAmount;
        usdcToken.transferFrom(msg.sender, address(this), depositCollateral); //Transfer borrower collateral to this contract
        liquidtyPool.sendUSDCToLendingContract(_loanAmount, address(this)); // Transfer USDC from LP to this contract
        usdcToken.transferFrom(address(this), msg.sender, _loanAmount); //Take assets from Liquidity Pool and send to borrower
    }

    function repayUSDCDebt() public onlyUSDCDebtHolder enoughUSDCInWallet {
        //require only the person who loan it can pay back
        uint256 amountToReturn = USDCLoanLedger[msg.sender]; //Get amount to return from USDCLoanLedger
        uint256 collateralAmount = USDCCollateralLedger[msg.sender]; //Get the collteral that is held by the Smart contract
        usdcToken.transferFrom(msg.sender, address(this), amountToReturn); //Transfer USDC to pay back from wallet to this smart contract
        uint256 lendingFeeToDeduct = calculatePercentage(collateralAmount, _lendingFee); //Calculate the USDC taken as comission 5%
        usdcToken.transferFrom(address(this), msg.sender, (collateralAmount - lendingFeeToDeduct)); //Transfer only 95% back
        usdcToken.transferFrom(address(this), reserves.getReservesAddress(), lendingFeeToDeduct); //Transfer 5% to the reserves
        USDCCollateralLedger[msg.sender] = 0; //Reset the ledger as the loan has been paid
        USDCLoanLedger[msg.sender] = 0; //Reset the ledger as the loan has been paid
    }

    //This function calculates Percentages
    //Used to calculate the amount of Loan that can be given and platform lendingFees
    //e.g 
    //Assume collateral = 100, desired percentage = 85%
    //function returns 85

    function calculatePercentage(uint256 collateralAmount, uint256 percentage) public pure returns (uint256) {
        return (collateralAmount * percentage) / 10_000;
    }

    function getHoldingUSDCCollateral() public view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    function getHoldingEthCollateral() public view returns (uint256) {
        return address(this).balance;
    }

    //Functions to return the amount of Debt the msg.sender has in USDC
    function getUSDCDebt() public view onlyUSDCDebtHolder returns (uint256) {
        return (USDCLoanLedger[msg.sender]);
    }

    /*
    //Functions to return the amount of Debt the msg.sender has in Eth
    function getEthDebt() public view onlyUSDCDebtHolder returns (uint256) {
        return (EthLedger[msg.sender]);
    }
    */

     modifier onlyUSDCDebtHolder() {
        require(USDCLoanLedger[msg.sender] > 0, "You do not have any outstanding debt");
        _;
    }

    /*
    modifier onlyEthDebtHolder() {
        require(EthLedger[msg.sender] > 0, "You do not have outstanding debt");
        _;
    }
    */

     modifier enoughUSDCInWallet() {
        require(usdcToken.balanceOf(msg.sender) > 0, "You do not have enough USDC to repay this debt");
        _;
    }

    //write withdraw function
    //figure out who owns the contract and how to send tokens back

}
