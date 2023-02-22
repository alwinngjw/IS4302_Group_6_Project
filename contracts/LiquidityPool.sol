// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./USDC.sol";
import "./Reserves.sol";

contract LiquidityPool {
    USDC usdcToken;
    Reserves reserves;
    uint256 platFee;
    //uint256 ethPool;
    //uint256 usdcPool;
    address thisContract = address(this);
    address contractOwner = msg.sender;
    mapping(address => uint256) ethTokenMap;
    mapping(address => uint256) usdcTokenMap;
    event Deposit(address indexed _from, uint _value, string _message);
    event withDrawingFromReserves ( address indexed _from, 
                                    address indexed _to, 
                                    uint _value, 
                                    string _message);
    uint256 oneEth = 1000000000000000000;

    constructor(USDC usdcTokenAddress, Reserves reservesAddress) {
        usdcToken = usdcTokenAddress;
        reserves = reservesAddress;
    }

   
     //Function takes in specified Amount of eth sent by the msg.sender
    function transferEth() public payable {
        require(msg.value > 0, "The amount of ether to transfer must be more than 0");
        ethTokenMap[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, "Your deposit has been made");
    }

    //Functions to return the amount of Eth this address lent the Protocol
    function getEthAmountLoan() public view onlyLender returns (uint256) {
        return (ethTokenMap[msg.sender] / oneEth);
    }

     modifier onlyLender() {
        require(ethTokenMap[msg.sender] > 0, "You do not have outstanding funds in the Liqudity Pool");
        _;
    }

    //Return the Total Value Locked inside the pool
    function getEthTvl() public view returns (uint256) {
        return address(this).balance;
    }
    
    
    function withDrawAllEth() public onlyLender {
        uint256 amountLent = ethTokenMap[msg.sender];
        //require (address(this).balance >= amountLent, "LP does not have enough funds, Withdrawing From Reserves");
        emit withDrawingFromReserves(address(this), 
                                     msg.sender,
                                     amountLent,
                                     "Withdrawing from reserves");
        reserves.sendEthToLP(amountLent, payable(msg.sender));
    }


    /*
    function withdrawEthFromReserves() public payable {
        reserves.sendEthToLP(msg.sender);
    }
    */
 
    
    /* DELETE
    //function to let owner withdraw specific amount in Eth
     function withDrawEth(uint256 amount) public ownerOnly {
        require(address(this).balance >= amount * oneEth, "Please ensure totalETHCReserve has enough amount!");
        address payable payableOwnerAddress = payable(_owner);
        payableOwnerAddress.transfer(amount * oneEth);
    }
    */


    /*
    function transferUSDC(uint256 amount) public {
        require(amount > 0, "The amount of USDC to transfer must be more than 0");
        usdcPool += amount; //adds the value to the pool
        usdcToken.transferFrom(msg.sender, address(this), amount);
        usdcTokenMap[msg.sender] += amount;
    }
    */


/*
    function withdrawEth(uint256 amountToWithdraw) public {
        uint256 currentUserInvestedEth = ethTokenMap[msg.sender]; // get current user invested eth
        require(currentUserInvestedEth >= amountToWithdraw, "Please ensure you have enough ETH balance to withdraw this amount!");
        
        uint256 yield = amountToWithdraw * 300 / 10_000 ; // 3 % of the amtToWithdraw
        uint256 yieldWithdrew = reserves.withdrawEth(yield); // withdraw yield from reserves

        uint256 finalWithdrawalAmt = amountToWithdraw + yieldWithdrew; // 60 + 3 = 63 eth
        ethPool -= amountToWithdraw;
        ethTokenMap[msg.sender] -= amountToWithdraw;
        
        // transfer final withdrawal amt back to the current user
        address payable receipient  = payable(msg.sender);
        receipient.transfer(finalWithdrawalAmt);
    }

    function withdrawUSDC(uint256 amountToWithdraw) public {
        uint256 currentUserInvestedUSDC = usdcTokenMap[msg.sender]; // get current user invested USDC
        require(currentUserInvestedUSDC >= amountToWithdraw, "Please ensure you have enough USDC balance to withdraw this amount!");

        uint256 yield = amountToWithdraw * 300 / 10_000; // 3 % of the amountToWithdraw
        uint256 yieldWithdrew = reserves.withdrawUSDC(yield); // withdraw usdc yield from reserves

        uint256 finalWithdrawalAmt = amountToWithdraw + yieldWithdrew;
        usdcPool -= amountToWithdraw;
        usdcTokenMap[msg.sender] -= amountToWithdraw;

        // transfer final withdrawal amt back to the current currentUser
        address receipient = msg.sender;
        bool isTransferred = usdcToken.transferFrom(thisContract, receipient, finalWithdrawalAmt);
    }
    function getAddress() public view returns (address) {
        return thisContract;
    }
    */
}