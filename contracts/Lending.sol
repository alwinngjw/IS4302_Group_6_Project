// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./LiquidityPool.sol";
import "./ERC20.sol";
import "./Reserves.sol";
import "./PriceFeed.sol";
import "./Avax.sol";
import "./IdentityToken.sol";

contract Lending {
    Avax avaxToken;
    LiquidityPool liquidityPool;
    Reserves reserves;
    PriceFeed priceFeed;
    IdentityToken identityToken;
    uint256 _maximumLendingPercentage = 8000; //80% of collateral
    uint256 verifiedLendingPercentage = 9000; //90% of collateral
    uint256 _lendingFee = 500; //5% of total collateral
    uint256 verifiedCommisionFee = 300; //verified users get 3% fee instead of 5%
    address _Owner = msg.sender;

    mapping(address => uint256) AVAXCollateralLedger;
    mapping(address => uint256) AVAXLoanLedger;
    mapping(address => uint256) AVAXCollateralValueLedgerinUSD;
    mapping(address => uint256) AVAXCUserTotalReturnTransactions;
    mapping(address => uint256) AVAXCUserTotalLiquidations;

    mapping(address => uint256) ETHCollateralLedger;
    mapping(address => uint256) ETHLoanLedger;
    mapping(address => uint256) ETHCollateralValueLedgerinUSD;
    mapping(address => uint256) ETHUserTotalReturnTransactions;
    mapping(address => uint256) ETHCUserTotalLiquidations;

    address[] ETHDebtors; // keep track who is still has outstanding loans
    address[] AVAXDebtors; // keep track who is still has outstanding loans
    
     constructor(Avax avaxTokenAddress, LiquidityPool lp, Reserves reservesAddress, PriceFeed pf, IdentityToken identityTokenAddress) {
        avaxToken = avaxTokenAddress;
        liquidityPool = lp;
        reserves = reservesAddress;
        priceFeed = pf;
        identityToken = identityTokenAddress;
    }

    function borrowAVAX(uint256 depositCollateral) public {
        require(depositCollateral != 0, "Please put more collateral");
        require (avaxToken.balanceOf(msg.sender) >= depositCollateral, "You do not have enough AVAX token!");
        AVAXDebtors.push(msg.sender);
        uint256 _loanAmount = 0; // set to 0 intially
        uint256 lendingFeeToDeduct = 0; //set to 0 intially

        //Directly deduct the 3% or 5% commission first and loan out the rest
        //User collateral will then be 95% of what is deposited
        if (identityToken.balanceOf(msg.sender) >= 1) {
            lendingFeeToDeduct = calculatePercentage(depositCollateral, verifiedCommisionFee); //3% of collateral
        } else {
            lendingFeeToDeduct = calculatePercentage(depositCollateral, _lendingFee); //5% of collateral
        }

        avaxToken.transferFrom(msg.sender, address(this), depositCollateral); //Take user collateral first
        avaxToken.transferFrom(address(this), reserves.getReservesAddress(), lendingFeeToDeduct); //Transfer 5% to the reserves first
        uint256 depositCollateralAfterComissionFee = depositCollateral - lendingFeeToDeduct;
       
        //Calculate the Loan amount
        //Give the user a better rate of only needing 90% collateral if he has a token, else give the usual 80% needed
        if (identityToken.balanceOf(msg.sender) >= 1) {
            //uint256 verifiedRate = 9000; // 90% collateral needed
            _loanAmount = calculatePercentage(depositCollateralAfterComissionFee, verifiedLendingPercentage); //90% of collateral
        } else {
            _loanAmount = calculatePercentage(depositCollateralAfterComissionFee, _maximumLendingPercentage); //80% of new collateral
        }

        AVAXCollateralLedger[msg.sender] += depositCollateralAfterComissionFee;
        AVAXLoanLedger[msg.sender] += _loanAmount;

        uint256 depositCollateralInUSD = depositCollateralAfterComissionFee * priceFeed.getAvaxPriceFirst(); //in USD
        AVAXCollateralValueLedgerinUSD[msg.sender] += depositCollateralInUSD;

        liquidityPool.sendAvaxToLendingContract(_loanAmount, address(this)); // Transfer AVAX from LP to this contract
        avaxToken.transferFrom(address(this), msg.sender, _loanAmount); //Take assets from Liquidity Pool and send to borrower
    }

    function repayAVAXDebt() public onlyAVAXDebtHolder {
        //require only the person who loan it can pay back
        uint256 amountToReturn = AVAXLoanLedger[msg.sender]; //Get amount to return from AvaxLoanLedger
        require (avaxToken.balanceOf(msg.sender) >= amountToReturn, "You do not have enough AVAX token!");

        uint256 collateralAmount = AVAXCollateralLedger[msg.sender]; //Get the collteral that is held by the Smart contract
        avaxToken.transferFrom(msg.sender, address(this), amountToReturn); //Transfer Avax to pay back from wallet to this smart contract
        avaxToken.transferFrom(address(this), msg.sender, collateralAmount); //Transfer only 95% back
        address lpAddress = liquidityPool.getLPAddress();
        avaxToken.transferFrom(address(this), lpAddress, amountToReturn); //Transfer only 95% back
        
        delete AVAXCollateralLedger[msg.sender]; //Reset the ledger as the loan has been paid
        delete AVAXLoanLedger[msg.sender]; //Reset the ledger as the loan has been paid
        delete AVAXCollateralValueLedgerinUSD[msg.sender];
        AVAXCUserTotalReturnTransactions[msg.sender] += 1;

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
        avaxToken.transferFrom(msg.sender, address(this), topUpCollateral);

        AVAXCollateralLedger[msg.sender] += topUpCollateral;
        AVAXCollateralValueLedgerinUSD[msg.sender] += topUpCollateralInUSD;
    }

     function liquidateAVAX() public ownerOnly {
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
                 AVAXCUserTotalLiquidations[accountAddress] += 1; //indicate that a user has been liquidated before
            }
        }
    }

     //Take collateral and give 85% 
    function borrowEth() public payable returns (uint256) {
        uint256 depositCollateral = msg.value;
        require(depositCollateral != 0, "Please put more collateral");

        uint256 depositCollateralInEth = depositCollateral / 1000000000000000000;

        ETHDebtors.push(msg.sender);
        uint256 lendingFeeToDeduct = 0;

        if (identityToken.balanceOf(msg.sender) >= 1) {
            lendingFeeToDeduct = calculatePercentage(depositCollateral, verifiedCommisionFee); //3% of collateral
        } else {
            lendingFeeToDeduct = calculatePercentage(depositCollateral, _lendingFee); //5% of collateral
        }
        //Transfer commission fee to the reserves
        address payable reservesAddress = payable(reserves.getReservesAddress()); 
        reservesAddress.transfer(lendingFeeToDeduct);

        uint256 _loanAmount = 0;
        depositCollateral = depositCollateral - lendingFeeToDeduct;

        if (identityToken.balanceOf(msg.sender) >= 1) {
            _loanAmount = calculatePercentage(depositCollateral, verifiedLendingPercentage); //90% of collateral
        } else {
            _loanAmount = calculatePercentage(depositCollateral, _maximumLendingPercentage); //85% of collateral
        }

        uint256 depositCollateralInUSD; 
        depositCollateralInUSD = depositCollateralInEth * priceFeed.getEthPriceFirst(); //in USD

        ETHCollateralLedger[msg.sender] += depositCollateral;
        ETHLoanLedger[msg.sender] += _loanAmount;
        ETHCollateralValueLedgerinUSD[msg.sender] += depositCollateralInUSD;
        
        liquidityPool.sendEthToLender(_loanAmount, payable(msg.sender));
        return msg.sender.balance;
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
        address payable msgSenderAddress = payable (msg.sender);
        uint256 amountToReturn = ETHLoanLedger[msg.sender]; //Get amount to return from USDCLoanLedger
        require (msg.value >= amountToReturn, "Value inserted is not enough");
        
        uint256 collateralAmount = ETHCollateralLedger[msg.sender]; //Get the collteral that is held by the Smart contract
       
        require (address(this).balance >= amountToReturn, "ERROR");
        address payable lpAddress = payable (liquidityPool.getLPAddress());
        msgSenderAddress.transfer(collateralAmount);
        lpAddress.transfer(amountToReturn);

        delete ETHCollateralLedger[msg.sender]; //Reset the ledger as the loan has been paid
        delete ETHLoanLedger[msg.sender]; //Reset the ledger as the loan has been paid
        delete ETHCollateralValueLedgerinUSD[msg.sender];
        ETHUserTotalReturnTransactions[msg.sender] += 1;
        
        for (uint256 i = 0; i < ETHDebtors.length; i++) {
            if (ETHDebtors[i] == msg.sender) {
                delete ETHDebtors[i];
            }
        }
    }
           
    function liquidateETH() public payable ownerOnly {
        uint256 currentPriceOfEth = priceFeed.getEthPriceToLiquidate();
        for (uint i = 0; i < ETHDebtors.length; i++) {
            uint256 newCollateralPrice = (currentPriceOfEth * (ETHCollateralLedger[ETHDebtors[i]] / 1000000000000000000));
            if (newCollateralPrice <= ETHCollateralValueLedgerinUSD[ETHDebtors[i]]) {
                //liquidate by sending collateral to the pool
                address accountAddress = ETHDebtors[i];
                address payable addressToSend = payable (liquidityPool.getLPAddress());
                addressToSend.transfer(ETHCollateralLedger[ETHDebtors[i]]);
                 delete ETHCollateralLedger[ETHDebtors[i]]; //Reset the ledger as the loan has been Liquidated
                 delete ETHLoanLedger[ETHDebtors[i]]; //Reset the ledger as the loan has been Liquidated
                 delete ETHCollateralValueLedgerinUSD[ETHDebtors[i]];
                 delete ETHDebtors[i];
                 ETHCUserTotalLiquidations[accountAddress] += 1;
            }
        }
    }

    function getETHCollateralLedgerAmount() public view returns (uint256) {
        return ETHCollateralLedger[msg.sender];
    }

    function getUserAVAXCollateralAmountInUSD() public view returns (uint256) {
       return AVAXCollateralValueLedgerinUSD[msg.sender];
    }
    

    function getUserTotaETHRepaymentAmount() public view returns (uint256) {
        return ETHUserTotalReturnTransactions[msg.sender];
    }

    function getUserTotaAVAXRepaymentAmount() public view returns (uint256) {
        return AVAXCUserTotalReturnTransactions[msg.sender];
    }

    //For testing purposes
    function initUserTotalEthRepaymentAmount() public returns (uint256) {
       ETHUserTotalReturnTransactions[msg.sender] += 100;
    }

    function initUserTotalAVAXRepaymentAmount() public returns (uint256) {
       AVAXCUserTotalReturnTransactions[msg.sender] += 100;
    }

    function getUserTotaETHLiquidationAmount() public view returns (uint256) {
        return ETHCUserTotalLiquidations[msg.sender];
    }

    function getUserTotaAVAXLiquidationAmount() public view returns (uint256) {
        return AVAXCUserTotalLiquidations[msg.sender];
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

    function getAddress() public view returns (address) {
        return address(this);
    }

    //Function to return transaction count
    function getTotalTransactionCount(address user) public view returns (uint256) {
        return AVAXCUserTotalReturnTransactions[user] + ETHUserTotalReturnTransactions[user];
    }

    modifier onlyAVAXDebtHolder() {
        require(AVAXLoanLedger[msg.sender] > 0, "You do not have any outstanding debt");
        _;
    }

    modifier onlyEthDebtHolder() {
        require(ETHLoanLedger[msg.sender] > 0, "You do not have any outstanding debt");
        _;
    }

    modifier ownerOnly() {
        require(msg.sender == _Owner, "Only the Owner can call this function");
        _;
    }
}