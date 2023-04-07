// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./Avax.sol";
import "./Reserves.sol";
import "./ERC20.sol";

contract LiquidityPool {
    Avax avaxToken;
    Reserves reserves;
    address thisContract = address(this);
    address contractOwner = msg.sender;

    mapping(address => uint256) ethTokenMap;
    mapping(address => uint256) avaxTokenMap;

    event Deposit(address indexed _from, uint _value, string _message);
    event Withdraw(address indexed _from, address indexed _to, uint _value, string _message);
    event withDrawingFromReserves ( address indexed _from, address indexed _to, uint _value, string _message);
    uint256 oneEth = 1000000000000000000;

    constructor(Avax avaxTokenAddress, Reserves reservesAddress) {
        avaxToken = avaxTokenAddress;
        reserves = reservesAddress;
    }

     //Function takes in specified amount of eth sent by the msg.sender
    function transferEth() public payable {
        require(msg.value > 0, "The amount of ether to transfer must be more than 0");
        ethTokenMap[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, "Your deposit has been made");
    }

    //Functions to return the amount of Eth this address lent the Protocol
    function getEthAmountLoan() public view onlyLender returns (uint256) {
        return (ethTokenMap[msg.sender] / oneEth);
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

   
    function transferAvax(uint256 amount) public {
        require(amount > 0, "The amount of Avax to transfer must be more than 0");
        //usdcPool += amount; //adds the value to the pool
        avaxToken.transferFrom(msg.sender, address(this), amount);
        avaxTokenMap[msg.sender] += amount;
        emit Deposit(msg.sender, amount, "Your deposit has been made");
    }

     //Return the Total Value Locked inside the USDC pool
    function getAvaxTvl() public view returns (uint256) {
         return avaxToken.balanceOf(address(this));
    }

     //Functions to return the amount of Eth this address lent the Protocol
    function getAvaxAmountLoan() public view onlyLenderAvax returns (uint256) {
        return (avaxTokenMap[msg.sender]);
    }

    function withDrawAllAvax() public onlyLenderAvax {
        address addressToSend = msg.sender;
        uint256 amountLent = avaxTokenMap[msg.sender];
        uint256 yield = amountLent * 300 / 10_000 ; // 3 % of the amtLent, yield should come from reserves
        if (amountLent < getAvaxTvl()) {
            //Withdraw From Reserves
            emit withDrawingFromReserves(address(this), msg.sender, amountLent, "Withdrawing from reserves");
            avaxToken.transferFrom(reserves.getReservesAddress(), address(this), (amountLent + yield)); // send from Reserves to LP First
            avaxToken.transferFrom(address(this), addressToSend, (amountLent + yield)); //Send from LP to wallet
        } else {
            //Do not require assets from reserves, only yield
             avaxToken.transferFrom(address(this), addressToSend, amountLent); //Sent lent amount to wallet from the pool
             avaxTokenMap[msg.sender] = 0; //Set to 0 to reset the loan
             avaxToken.transferFrom(reserves.getReservesAddress(), address(this), yield); // Send yield from Reserves to LP first
             avaxToken.transferFrom(address(this), addressToSend, yield); // Send yield from LP to wallet
             emit Withdraw(address(this), msg.sender, (amountLent + yield), "Your assets has been successfully withdrawn");
        } 
    }

    //To simulate that our LP already have Avax tokens, trigger this function to send 1000 Avax tokens over
    //Note this function is for demostration purposes only, production code will not have this!
    function InitialiseLP() public ownerOnly {
        avaxToken.mint(address(this), 1000);
    }

    function getLPAddress() public view returns (address) {
        return address(this);
    }

    function sendAvaxToLendingContract(uint256 amountToSend, address lendingContractAddress) public {
        require (getAvaxTvl() >= amountToSend, "LP does not have enough funds");
        avaxToken.transferFrom(address(this), lendingContractAddress, amountToSend);
    }

    function sendEthToLender(uint256 amountToSend, address payable lenderAddress) public {
        require (getEthTvl() >= amountToSend, "LP does not have enough funds");
        lenderAddress.transfer(amountToSend);
    }

    modifier onlyLender() {
        require(ethTokenMap[msg.sender] > 0, "You do not have outstanding funds in the Liqudity Pool");
        _;
    }

    modifier onlyLenderAvax() {
        require(avaxTokenMap[msg.sender] > 0, "You do not have outstanding funds in the Liqudity Pool");
        _;
    }

      modifier ownerOnly() {
        require(msg.sender == contractOwner, "Only the Owner can call this function");
        _;
    }

    //Used to accept Eth
    fallback() external payable{}
}
