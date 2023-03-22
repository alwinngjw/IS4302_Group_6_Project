// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./Lending.sol";
import "./WalletFeed.sol";
import "./IdentityToken.sol";

// This contract allows the market to verify an identity is valid

contract IdentityMarket {
    address private owner;
    
    enum applicationStatus { pending, active, rejected }

    struct IdentityApplication{
        bytes32 hash;
        address applicant;
        applicationStatus status;
    }

    mapping(bytes32 => IdentityApplication) public applications;

    Lending lendingContract;
    WalletFeed walletFeed;
    IdentityToken identityToken;
    uint256 minWalletValue = 1000000;
    uint256 minTransactions = 100;

    constructor (Lending _lendingContract, WalletFeed _walletFeed, IdentityToken _identityToken) {
        owner = msg.sender;
        lendingContract = _lendingContract;
        walletFeed = _walletFeed;
        identityToken = _identityToken;
    }

    modifier authorisedAccounts() {
        require(msg.sender == owner); // TODO add more whitelisted accounts
        _;
    }

    function submitIdentity(bytes32 _identityHash) public {
        IdentityApplication storage application = applications[_identityHash];

        application.applicant = msg.sender;
        application.hash = _identityHash;
        application.status = applicationStatus.pending;
    }

    function approveIdentity(bytes32 _identityHash) authorisedAccounts() public {
        IdentityApplication storage application = applications[_identityHash];
        require(application.hash != 0, "Identity Application does not exist");

        application.status = applicationStatus.active;

       identityToken.getIdentity();

       identityToken.transferIdentity(address(this), msg.sender, 1); 
    }

    function rejectIdentity(bytes32 _identityHash) public {
        IdentityApplication storage application = applications[_identityHash];
        require(application.hash != 0, "Identity Application does not exist");

        application.status = applicationStatus.rejected;
    }

    function verifyIdentity(bytes32 _identityHash) public view returns (bool) {
        applicationStatus _status = applications[_identityHash].status;

        if (_status == applicationStatus.active) {
            return true;
        } else {
            return false;
        }
    }

    function evaluateIdentity(bytes32 _identityHash) public view returns (bool) {
        address _applicant = applications[_identityHash].applicant;
        uint256 applicantTotalTransactions = lendingContract.getTotalTransactionCount(_applicant); 
        uint256 applicantWalletValue = walletFeed.getWalletValue();

        if (applicantTotalTransactions >= minTransactions && applicantWalletValue >= minWalletValue) {
            return true;
        } else {
            return false;
        }
    }
}