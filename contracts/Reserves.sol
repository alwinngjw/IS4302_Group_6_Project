// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./Avax.sol";
import "./ERC20.sol";

contract Reserves {

    Avax avaxToken;
    //LiquidityPool liquidityPool;
    //uint256 totalEthReserve;
    //uint256 totalUSDCReserve;
    address _owner = msg.sender;
    event Deposit(address indexed _from, uint _value, string _message);
    uint256 oneEth = 1000000000000000000;

    constructor(Avax avaxTokenAddress) {
        avaxToken = avaxTokenAddress;
    }

    //Function takes in specified Amount of eth sent by the msg.sender
    function addEthToReserve() public payable {
        emit Deposit(msg.sender, msg.value, "Your deposit has been made");
    }

    //Trigger this function if more USDC is required
    //Function allows contract to specify how much USDC is needed
    function addAvaxToReserve(uint256 amountRequested) public payable {
        avaxToken.mint(address(this), amountRequested);
    }

    //To simulate that our reserves already have USDC tokens, trigger this function to send 1000 USDC tokens over
    function InitialiseReserves() public ownerOnly {
        avaxToken.mint(address(this), 1000);
    }


     //function to let owner withdraw specific amount in Eth
     function withDrawEth(uint256 amount) public ownerOnly {
        require(address(this).balance >= amount * oneEth, "Please ensure totalETHCReserve has enough amount!");
        address payable payableOwnerAddress = payable(_owner);
        payableOwnerAddress.transfer(amount * oneEth);
    }

    //function to let owner withdraw specific amount in USDC tokens
    function withdrawAvax(uint256 amount) public ownerOnly returns (uint256) {
        require(avaxToken.balanceOf(address(this)) >= amount, "Please ensure totalUSDCReserve has enough amount!");
        avaxToken.transferFrom(address(this), _owner, amount);
        return amount;
    }
    
    //Returns total amount of USDC in the Reserves Contract
    function getTotalAvaxHolding() public view returns (uint256){
        return avaxToken.balanceOf(address(this));
    }

    //Returns total amount of Eth in the Reserves Contract
    function getTotalEthCHolding() public view returns (uint256){
        return address(this).balance / oneEth;
    }
   
    modifier ownerOnly() {
        require(msg.sender == _owner, "Only the Owner can call this function");
        _;
    }

     function sendEthToLP(uint256 amount, address addressToSend) public payable ownerOnly {
        address payable addressToSend = payable(addressToSend);
        addressToSend.transfer(amount);
    }
    
    function getReservesAddress() public view returns (address) {
        return address(this);
    }
    //Used to accept Eth
    fallback() external payable{}
}