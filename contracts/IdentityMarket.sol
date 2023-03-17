// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

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

    modifier ownerOnly() {
        require(msg.sender == owner); 
        _;
    }

    function submitIdentity(bytes32 _identityHash) public {
        IdentityApplication storage application = applications[_identityHash];

        application.applicant = msg.sender;
        application.hash = _identityHash;
        application.status = applicationStatus.pending;
    }

    function approveIdentity(bytes32 _identityHash) public {
        IdentityApplication storage application = applications[_identityHash];
        require(application.hash != 0, "Identity Application does not exist");

        application.status = applicationStatus.active;
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



}