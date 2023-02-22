pragma solidity ^0.8.7;
import "./USDC.sol";
import "./Reserves.sol";

contract LiquidityPool {
    USDC usdcToken;
    Reserves reserves;
    uint256 platFee;
    uint256 ethPool;
    uint256 usdcPool;
    address thisContract = address(this);
    address contractOwner = msg.sender;
    mapping(address => uint256) ethTokenMap;
    mapping(address => uint256) usdcTokenMap;

    constructor(USDC usdcTokenAddress, uint256 platformFee, Reserves reservesAddress) {
        usdcToken = usdcTokenAddress;
        platFee = platformFee;
        reserves = reservesAddress;
    }

    function transferEth(uint256 amount) public payable {
        require(amount > 0, "The amount of ether to transfer must be more than 0");
        ethPool += amount;
        ethTokenMap[msg.sender] += amount;
    }

    function transferUSDC(uint256 amount) public payable {
        require(amount > 0, "The amount of USDC to transfer must be more than 0");
        usdcPool += amount;
        usdcTokenMap[msg.sender] += amount;
    }

    function withdrawEth(uint256 amountToWithdraw) public payable {
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

    function withdrawUSDC(uint256 amountToWithdraw) public payable {
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
}