// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Identity {
    struct user {
        address owner;
        uint256 creditScore;
    }
    uint256 public numUsers = 0;
    mapping(uint256 => user) public users;
    

    event IdentityIssued(address _from);

    // Users can get identity from us 
    // Identity issued through an ID
    function getIdentity() public payable returns (uint256) {
        require(msg.value > 0, "The amount of ether to transfer must be more than 0");
        user memory newUser = user(
            msg.sender,
            0
        );

        uint256 newUserId = numUsers++;
        users[newUserId] = newUser;

        emit IdentityIssued(msg.sender);
        return newUserId;
    }

    // Verifiers (e.g. lenders) can check user credit score
    function getUserScore(uint256 userId) public view returns (uint256) {
        return users[userId].creditScore;
    }

    modifier ownerOnly(uint256 userId) {
        require(users[userId].owner == msg.sender); 
        _;
    }

    modifier validUserId(uint256 userId) {
        require(userId < numUsers);
        _;
    }

}