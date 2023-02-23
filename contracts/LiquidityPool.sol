// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./USDC.sol";
import "./Reserves.sol";
import "./ERC20.sol";

contract LiquidityPool {
    USDC usdcToken;
    Reserves reserves;
    address thisContract = address(this);
    address contractOwner = msg.sender;
    mapping(address => uint256) ethTokenMap;
    mapping(address => uint256) usdcTokenMap;
    event Deposit(address indexed _from, uint _value, string _message);
    event Withdraw(address indexed _from, address indexed _to, uint _value, string _message);
    event withDrawingFromReserves ( address indexed _from, address indexed _to, uint _value, string _message);
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

    //Return the Total Value Locked inside the ETH pool
    function getEthTvl() public view returns (uint256) {
        return address(this).balance;
    }
    
    
    //Function allows borrower to withdraw all their eth that they have lent the protocol
    //not complete yet as, original loan should be paid by the pool
    //Yield from the reserves
    //***Still unable to send eth from Reserves to LP contract
    // add if statement
    function withDrawAllEth() public onlyLender {
        uint256 amountLent = ethTokenMap[msg.sender];
        uint256 yield = amountLent * 300 / 10_000 ; // 3 % of the amtLent, yield should come from reserves
        payable(msg.sender).transfer(amountLent);
        reserves.sendEthToLP(yield, payable(msg.sender));
        ethTokenMap[msg.sender] = 0; //Reset the loan back to 0
    }

   
    function transferUSDC(uint256 amount) public {
        require(amount > 0, "The amount of USDC to transfer must be more than 0");
        //usdcPool += amount; //adds the value to the pool
        usdcToken.transferFrom(msg.sender, address(this), amount);
        usdcTokenMap[msg.sender] += amount;
        emit Deposit(msg.sender, amount, "Your deposit has been made");
    }

     //Return the Total Value Locked inside the USDC pool
    function getUSDCTvl() public view returns (uint256) {
         return usdcToken.balanceOf(address(this));
    }

     //Functions to return the amount of Eth this address lent the Protocol
    function getUSDCAmountLoan() public view onlyLenderUSDC returns (uint256) {
        return (usdcTokenMap[msg.sender]);
    }

    function withDrawAllUSDC() public onlyLenderUSDC {
        address addressToSend = msg.sender;
        uint256 amountLent = usdcTokenMap[msg.sender];
        uint256 yield = amountLent * 300 / 10_000 ; // 3 % of the amtLent, yield should come from reserves
        if (amountLent < getUSDCTvl()) {
            //Withdraw From Reserves
            emit withDrawingFromReserves(address(this), msg.sender, amountLent, "Withdrawing from reserves");
            usdcToken.transferFrom(reserves.getReservesAddress(), address(this), (amountLent + yield)); // send from Reserves to LP First
            usdcToken.transferFrom(address(this), addressToSend, (amountLent + yield)); //Send from LP to wallet
        } else {
            //Do not require assets from reserves, only yield
             usdcToken.transferFrom(address(this), addressToSend, amountLent); //Sent lent amount to wallet from the pool
             usdcTokenMap[msg.sender] = 0; //Set to 0 to reset the loan
             usdcToken.transferFrom(reserves.getReservesAddress(), address(this), yield); // Send yield from Reserves to LP first
             usdcToken.transferFrom(address(this), addressToSend, yield); // Send yield from LP to wallet
            emit Withdraw(address(this), msg.sender, (amountLent + yield), "Your assets has been successfully withdrawn");
        } 
    }

     modifier onlyLenderUSDC() {
        require(usdcTokenMap[msg.sender] > 0, "You do not have outstanding funds in the Liqudity Pool");
        _;
    }
    
}