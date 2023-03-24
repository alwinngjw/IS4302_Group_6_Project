// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./Identity.sol";
import "./Lending.sol";
import "./WalletFeed.sol";
import "./IdentityToken.sol";

// This contract allows the market to verify an identity is valid

contract IdentityMarket {
    address private owner;

    enum applicationStatus {
        pending,
        active,
        rejected
    }

    struct IdentityApplication {
        address applicant;
        applicationStatus status;
    }

    mapping(address => IdentityApplication) public applications;

    Identity identityContract;
    Lending lendingContract;
    WalletFeed walletFeed;
    IdentityToken identityToken;
    uint256 minWalletValue = 1000000;
    uint256 minTransactions = 100;

    constructor(
        Identity _identityContract,
        Lending _lendingContract,
        WalletFeed _walletFeed,
        IdentityToken _identityToken
    ) {
        owner = msg.sender;
        identityContract = _identityContract;
        lendingContract = _lendingContract;
        walletFeed = _walletFeed;
        identityToken = _identityToken;
    }

    event IdentitySubmitted(address _user);
    event IdentityApproved(address _user);
    event IdentityRejected(address _user);

    modifier contractOwnerOnly() {
        require(
            msg.sender == owner,
            "Only the contract owner can perform this function"
        );
        _;
    }

    modifier hasApplication(address _user) {
        require(
            applications[_user].applicant != address(0),
            "User does not have an identity application"
        );
        _;
    }

    function submitIdentity() public {
        require(
            identityContract.getOwner(msg.sender) == msg.sender,
            "Please create an identity first"
        );

        IdentityApplication storage application = applications[msg.sender];
        application.applicant = msg.sender;
        application.status = applicationStatus.pending;

        emit IdentitySubmitted(application.applicant);
    }

    function approveIdentity(address _user) public contractOwnerOnly {
        IdentityApplication storage application = applications[_user];
        require(
            application.applicant != address(0),
            "Identity Application does not exist"
        );

        application.status = applicationStatus.active;

        identityToken.getIdentity();

        identityToken.transferIdentity(address(this), _user, 1);

        emit IdentityApproved(_user);
    }

    function rejectIdentity(address _user) public contractOwnerOnly {
        IdentityApplication storage application = applications[_user];
        require(
            application.applicant != address(0),
            "Identity Application does not exist"
        );

        application.status = applicationStatus.rejected;

        emit IdentityRejected(_user);
    }

    function evaluateIdentity(address _user) public contractOwnerOnly hasApplication(_user) {
        address _applicant = applications[_user].applicant;
        //uint256 applicantTotalTransactions = lendingContract.getTotalTransactionCount(_applicant);
        uint256 applicantTotalTransactions = walletFeed.getTransactionCount();
        uint256 applicantWalletValue = walletFeed.getWalletValue();
        
        if (
            applicantTotalTransactions >= minTransactions &&
            applicantWalletValue >= minWalletValue
        ) {
            approveIdentity(_applicant);
        } else {
            rejectIdentity(_applicant);
        }
    }

    function getApplicationStatus(address _user) public view returns (uint256) {
        applicationStatus _status = applications[_user].status;

        if (_status == applicationStatus.pending) {
            return 0;
        } else if (_status == applicationStatus.active) {
            return 1;
        } else {
            return 2;
        }
    }
}
