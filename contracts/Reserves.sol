// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./USDC.sol";
import "./ERC20.sol";

contract Reserves {

    USDC usdcToken;
    //LiquidityPool liquidityPool;
    //uint256 totalEthReserve;
    //uint256 totalUSDCReserve;
    address _owner = msg.sender;
    event Deposit(address indexed _from, uint _value, string _message);
    uint256 oneEth = 1000000000000000000;

    constructor(USDC usdcTokenAddress) {
        usdcToken = usdcTokenAddress;
    }

    //Function takes in specified Amount of eth sent by the msg.sender
    function addEthToReserve() public payable {
        emit Deposit(msg.sender, msg.value, "Your deposit has been made");
    }

    //Trigger this function if more USDC is required
    //Function allows contract to specify how much USDC is needed
    function addUSDCToReserve(uint256 amountRequested) public payable {
        usdcToken.mint(address(this), amountRequested);
    }

    //To simulate that our reserves already have USDC tokens, trigger this function to send 1000 USDC tokens over
    function InitialiseReserves() public ownerOnly {
        usdcToken.mint(address(this), 1000);
    }


     //function to let owner withdraw specific amount in Eth
     function withDrawEth(uint256 amount) public ownerOnly {
        require(address(this).balance >= amount * oneEth, "Please ensure totalETHCReserve has enough amount!");
        address payable payableOwnerAddress = payable(_owner);
        payableOwnerAddress.transfer(amount * oneEth);
    }

    //function to let owner withdraw specific amount in USDC tokens
    function withdrawUSDC(uint256 amount) public ownerOnly returns (uint256) {
        require(usdcToken.balanceOf(address(this)) >= amount, "Please ensure totalUSDCReserve has enough amount!");
        usdcToken.transferFrom(address(this), _owner, amount);
        return amount;
    }
    
    //Returns total amount of USDC in the Reserves Contract
    function getTotalUSDCHolding() public view returns (uint256){
        return usdcToken.balanceOf(address(this));
    }

    //Returns total amount of Eth in the Reserves Contract
    function getTotalEthCHolding() public view returns (uint256){
        return address(this).balance / oneEth;
    }
   
    modifier ownerOnly() {
        require(msg.sender == _owner, "Only the Owner can call this function");
        _;
    }

    //Unfinshed only the LP should be able to call this function
    //Make a modifier for this
    //DELEET THIS
     function sendEthToLP(uint256 amount, address addressToSend) public payable {
        address payable addressToSend = payable(addressToSend);
        addressToSend.transfer(amount);
    }
    
    /*
    function sendEthToLP(address addressToSend) public payable {
        address payable addressToSend = payable(addressToSend);
        addressToSend.transfer(1 ether);
    }
    */
}