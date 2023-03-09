// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./LiquidityPool.sol";
import "./ERC20.sol";
import "./Reserves.sol";
import "./PriceFeed.sol";
import "./Avax.sol";

contract Lending {
    Avax avaxToken;
    LiquidityPool liquidityPool;
    Reserves reserves;
    PriceFeed priceFeed;
    uint256 _maximumLendingPercentage = 8500; //85% of collateral
    uint256 _lendingFee = 500; //5% of total collateral
    address _debtOwner = msg.sender;

    mapping(address => uint256) AVAXCollateralLedger;
    mapping(address => uint256) AVAXLoanLedger;
    mapping(address => uint256) AVAXCollateralValueLedgerinUSD;

    mapping(address => uint256) ETHCollateralLedger;
    mapping(address => uint256) ETHLoanLedger;
    mapping(address => uint256) ETHCollateralValueLedgerinUSD;

    address[] ETHDebtors; // keep track who is still has outstanding loans
    address[] AVAXDebtors; // keep track who is still has outstanding loans
    
     constructor(Avax avaxTokenAddress, LiquidityPool lp, Reserves reservesAddress,  PriceFeed pf) {
        avaxToken = avaxTokenAddress;
        liquidityPool = lp;
        reserves = reservesAddress;
        priceFeed = pf;
    }

    //Take collateral and give 85% 
    function borrowAVAX(uint256 depositCollateral) public {
        require(depositCollateral != 0, "Please put more collateral");
        require (avaxToken.balanceOf(msg.sender) >= depositCollateral, "You do not have enough AVAX token!");
        AVAXDebtors.push(msg.sender);
        uint256 _loanAmount = calculatePercentage(depositCollateral, _maximumLendingPercentage); //85% of collateral

        AVAXCollateralLedger[msg.sender] = depositCollateral;
        AVAXLoanLedger[msg.sender] = _loanAmount;

        uint256 depositCollateralInUSD = depositCollateral; //in USD
        AVAXCollateralValueLedgerinUSD[msg.sender] = depositCollateralInUSD;

        address liqudityPoolAddress = liquidityPool.getLPAddress();
        avaxToken.transferFrom(msg.sender, address(this), depositCollateral); //Transfer borrower collateral to this contract
        liquidityPool.sendAvaxToLendingContract(_loanAmount, address(this)); // Transfer AVAX from LP to this contract
        avaxToken.transferFrom(address(this), msg.sender, _loanAmount); //Take assets from Liquidity Pool and send to borrower
    }

    function repayAVAXDebt() public onlyAVAXDebtHolder enoughAVAXInWallet {
        //require only the person who loan it can pay back
        uint256 amountToReturn = AVAXLoanLedger[msg.sender]; //Get amount to return from USDCLoanLedger
        require (avaxToken.balanceOf(msg.sender) >= amountToReturn, "You do not have enough AVAX token!");

        uint256 collateralAmount = AVAXCollateralLedger[msg.sender]; //Get the collteral that is held by the Smart contract
        avaxToken.transferFrom(msg.sender, address(this), amountToReturn); //Transfer USDC to pay back from wallet to this smart contract
        uint256 lendingFeeToDeduct = calculatePercentage(collateralAmount, _lendingFee); //Calculate the USDC taken as comission 5%
        avaxToken.transferFrom(address(this), msg.sender, (collateralAmount - lendingFeeToDeduct)); //Transfer only 95% back
        avaxToken.transferFrom(address(this), reserves.getReservesAddress(), lendingFeeToDeduct); //Transfer 5% to the reserves
        
        delete AVAXCollateralLedger[msg.sender]; //Reset the ledger as the loan has been paid
        delete AVAXLoanLedger[msg.sender]; //Reset the ledger as the loan has been paid
        delete AVAXCollateralValueLedgerinUSD[msg.sender];
        for (uint256 i = 0; i < AVAXDebtors.length; i++) {
            if (AVAXDebtors[i] == msg.sender) {
                delete AVAXDebtors[i];
            }
        }
    }

    function topUpAVAXCollateral(uint256 topUpCollateral) public onlyAVAXDebtHolder {
        
        require(topUpCollateral != 0, "Please put more collateral");
        require (avaxToken.balanceOf(msg.sender) >= topUpCollateral, "You do not have enough AVAX token!");
        uint256 topUpCollateralInUSD; 
        topUpCollateralInUSD = topUpCollateral * priceFeed.getAvaxPriceFirst(); //in USD

        AVAXCollateralLedger[msg.sender] += topUpCollateral;
        AVAXCollateralValueLedgerinUSD[msg.sender] += topUpCollateralInUSD;
    }

     function liquidateAVAX() public {
        uint256 currentPriceOfAVAX = priceFeed.getAvaxPriceToLiquidate();
        for (uint i = 0; i < AVAXDebtors.length; i++) {
            uint256 newCollateralPrice = (currentPriceOfAVAX * (AVAXCollateralLedger[AVAXDebtors[i]]));
            if (newCollateralPrice <= AVAXCollateralValueLedgerinUSD[AVAXDebtors[i]]) {
                //liquidate by sending collateral to the pool
                 //addressToSend.transfer(ETHCollateralLedger[ETHDebtors[i]]);
                 address accountAddress = AVAXDebtors[i];
                 avaxToken.transferFrom(address(this), liquidityPool.getLPAddress(), AVAXCollateralLedger[accountAddress]);
                 delete AVAXCollateralLedger[AVAXDebtors[i]]; //Reset the ledger as the loan has been Liquidated
                 delete AVAXLoanLedger[AVAXDebtors[i]]; //Reset the ledger as the loan has been Liquidated
                 delete AVAXCollateralValueLedgerinUSD[AVAXDebtors[i]];
                 delete AVAXDebtors[i];
            }
        }
    }

     //Take collateral and give 85% 
    function borrowEth() public payable returns (uint256) {
        uint256 depositCollateral = msg.value;
        require(depositCollateral != 0, "Please put more collateral");
        uint256 depositCollateralInEth = depositCollateral / 1000000000000000000;
        uint256 depositCollateralInUSD; 
        ETHDebtors.push(msg.sender);
        depositCollateralInUSD = depositCollateralInEth * priceFeed.getEthPriceFirst(); //in USD

        uint256 _loanAmount = calculatePercentage(depositCollateral, _maximumLendingPercentage); //85% of collateral
        ETHCollateralLedger[msg.sender] = depositCollateral;
        ETHLoanLedger[msg.sender] = _loanAmount;
        ETHCollateralValueLedgerinUSD[msg.sender] = depositCollateralInUSD;
        
        liquidityPool.sendEthToLender(_loanAmount, payable(msg.sender));
        return ETHCollateralValueLedgerinUSD[msg.sender];
    }

    function topUpETHCollateral() public payable onlyEthDebtHolder {
        uint256 topUpCollateral = msg.value;
        require(topUpCollateral != 0, "Please put more collateral");
        uint256 topUpCollateralInEth = topUpCollateral / 1000000000000000000;
        uint256 topUpCollateralInUSD; 
        topUpCollateralInUSD = topUpCollateralInEth * priceFeed.getEthPriceFirst(); //in USD

        ETHCollateralLedger[msg.sender] += topUpCollateral;
        ETHCollateralValueLedgerinUSD[msg.sender] += topUpCollateralInUSD;
    }

   

    function repayEth() public payable onlyEthDebtHolder {
        //require only the person who loan it can pay back
     
        uint256 amountToReturn = ETHLoanLedger[msg.sender]; //Get amount to return from USDCLoanLedger
        require (msg.value >= amountToReturn, "Value inserted is not enough");
        uint256 collateralAmount = ETHCollateralLedger[msg.sender]; //Get the collteral that is held by the Smart contract
       
        uint256 lendingFeeToDeduct = calculatePercentage(collateralAmount, _lendingFee); //Calculate the USDC taken as comission 5%
        address payable addressToSend = payable (msg.sender);
        addressToSend.transfer(collateralAmount - lendingFeeToDeduct);
        //Send back to LP
        require (address(this).balance >= amountToReturn, "ERROR");
        address payable lpAddress = payable (liquidityPool.getLPAddress());
        lpAddress.transfer(amountToReturn);

        //Send comissionFee to reserves
        address payable reservesAddress = payable(reserves.getReservesAddress());
        reservesAddress.transfer(lendingFeeToDeduct);

        delete ETHCollateralLedger[msg.sender]; //Reset the ledger as the loan has been paid
        delete ETHLoanLedger[msg.sender]; //Reset the ledger as the loan has been paid
        delete ETHCollateralValueLedgerinUSD[msg.sender];
        
        for (uint256 i = 0; i < ETHDebtors.length; i++) {
            if (ETHDebtors[i] == msg.sender) {
                delete ETHDebtors[i];
            }
        }
    }
           
    function liquidateETH() public payable {
        uint256 currentPriceOfEth = priceFeed.getEthPriceToLiquidate();
        for (uint i = 0; i < ETHDebtors.length; i++) {
            uint256 newCollateralPrice = (currentPriceOfEth * (ETHCollateralLedger[ETHDebtors[i]] / 1000000000000000000));
            if (newCollateralPrice <= ETHCollateralValueLedgerinUSD[ETHDebtors[i]]) {
                //liquidate by sending collateral to the pool
                address payable addressToSend = payable (liquidityPool.getLPAddress());
                addressToSend.transfer(ETHCollateralLedger[ETHDebtors[i]]);
                 delete ETHCollateralLedger[ETHDebtors[i]]; //Reset the ledger as the loan has been Liquidated
                 delete ETHLoanLedger[ETHDebtors[i]]; //Reset the ledger as the loan has been Liquidated
                 delete ETHCollateralValueLedgerinUSD[ETHDebtors[i]];
                 delete ETHDebtors[i];
            }
        }
    }

    //This function calculates Percentages
    //Used to calculate the amount of Loan that can be given and platform lendingFees
    //e.g 
    //Assume collateral = 100, desired percentage = 85%
    //function returns 85

    function calculatePercentage(uint256 collateralAmount, uint256 percentage) public pure returns (uint256) {
        return (collateralAmount * percentage) / 10_000;
    }

    function getHoldingAVAXCollateral() public view returns (uint256) {
        return avaxToken.balanceOf(address(this));
    }

    function getHoldingEthCollateral() public view returns (uint256) {
        return address(this).balance;
    }

    //Functions to return the amount of Debt the msg.sender has in USDC
    function getAVAXDebt() public view onlyAVAXDebtHolder returns (uint256) {
        return (AVAXLoanLedger[msg.sender]);
    }

    modifier onlyAVAXDebtHolder() {
        require(AVAXLoanLedger[msg.sender] > 0, "You do not have any outstanding debt");
        _;
    }

    modifier onlyEthDebtHolder() {
        require(ETHLoanLedger[msg.sender] > 0, "You do not have outstanding debt");
        _;
    }
    
     modifier enoughAVAXInWallet() {
        require(avaxToken.balanceOf(msg.sender) > 0, "You do not have enough USDC to repay this debt");
        _;
    }
}