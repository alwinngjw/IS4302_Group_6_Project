// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Identity {
    mapping(address => User) public users;

    struct User {
        address owner;
        bytes32 publicKey;
        mapping(bytes32 => Attribute) attributes;
    }

    /**
     * Attributes are items that strengthen validity of identity e.g. driver's licence
     */
    struct Attribute {
        bytes32 hash; // hash of document
        mapping(bytes32 => Validation) validations;
    }

    /**
     * Validations validate the attributes of identity, further strengthening validity
     * of identity
     */
    struct Validation {
        address validator; // entity validating
        bytes32 hash;
        bool accepted; // true if user accepts the validation
    }

    event IdentityIssued(address _from);
    event AttributeAdded(address _owner, bytes32 _hash);
    event AttributeRemoved(address _owner, bytes32 _hash);
    event AttributeUpdated(address _owner, bytes32 _oldHash, bytes32 _newHash);
    event ValidationAdded(
        address _owner,
        address validator,
        bytes32 attributeHash
    );
    event ValidationRemoved(address _owner, bytes32 attributeHash);
    event ValidationAccepted(
        address _owner,
        bytes32 attributeHash,
        bytes32 validationHash
    );

    event PublicKeySet(bytes32 _publicKey);

    modifier notOwner(address _user) {
        require(msg.sender != _user, "Owners cannot create/remove validations");
        _;
    }

    modifier hasAccount() {
        require(
            users[msg.sender].owner != address(0),
            "Please create an identity first!"
        );
        _;
    }

    function createIdentity() public {
        User storage newUser = users[msg.sender];
        newUser.owner = msg.sender;

        emit IdentityIssued(msg.sender);
    }

    function addAttribute(bytes32 _hash) public hasAccount {
        require(
            users[msg.sender].attributes[_hash].hash == 0,
            "Attribute hash already present in mapping"
        );

        Attribute storage newAttribute = users[msg.sender].attributes[_hash];
        newAttribute.hash = _hash;

        emit AttributeAdded(msg.sender, _hash);
    }

    function removeAttribute(bytes32 _hash) public hasAccount {
        require(
            users[msg.sender].attributes[_hash].hash == _hash,
            "Attribute hash not present in mapping"
        );

        delete (users[msg.sender].attributes[_hash]);

        emit AttributeRemoved(msg.sender, _hash);
    }

    function updateAttribute(
        bytes32 _oldHash,
        bytes32 _newHash
    ) public hasAccount returns (bool) {
        require(
            users[msg.sender].attributes[_oldHash].hash == _oldHash,
            "Attribute hash not present in mapping"
        );

        removeAttribute(_oldHash);
        addAttribute(_newHash);

        emit AttributeUpdated(users[msg.sender].owner, _oldHash, _newHash);
        return true;
    }

    function addValidation(
        address userAddress,
        bytes32 attributeHash,
        bytes32 validationHash
    ) public notOwner(userAddress) returns (Validation memory) {
        Attribute storage attribute = users[userAddress].attributes[
            attributeHash
        ];
        require(
            attribute.hash == attributeHash,
            "Attribute hash not present in mapping"
        );
        Validation storage validation = attribute.validations[validationHash];
        require(validation.hash == 0, "Validation hash already present");

        validation.hash = validationHash;
        validation.accepted = false;
        validation.validator = msg.sender;

        emit ValidationAdded(
            userAddress,
            validation.validator,
            validation.hash
        );
        return validation;
    }

    function removeValidation(
        address userAddress,
        bytes32 attributeHash,
        bytes32 validationHash
    ) public notOwner(userAddress) {
        Attribute storage attribute = users[userAddress].attributes[
            attributeHash
        ];
        Validation storage validation = attribute.validations[validationHash];
        require(
            validation.hash == validationHash,
            "Validation hash is not present"
        );
        require(
            msg.sender == validation.validator,
            "You are not authorised to remove validation as you are not the validator"
        );

        delete attribute.validations[validationHash];

        emit ValidationRemoved(userAddress, attributeHash);
    }

    function acceptValidation(
        bytes32 attributeHash,
        bytes32 validationHash
    ) public {
        Attribute storage attribute = users[msg.sender].attributes[
            attributeHash
        ];
        Validation storage validation = attribute.validations[validationHash];

        validation.accepted = true;

        emit ValidationAccepted(msg.sender, attributeHash, validationHash);
    }

    function setPublicKey(bytes32 _publicKey) public hasAccount {
        users[msg.sender].publicKey = _publicKey;

        emit PublicKeySet(_publicKey);
    }

    // getter functions for testing
    function getOwner(address _user) public view returns (address) {
        return users[_user].owner;
    }

    function getAttribute(
        address _user,
        bytes32 _attributeHash
    ) public view returns (bytes32) {
        return users[_user].attributes[_attributeHash].hash;
    }

    function getValidation(
        address _user,
        bytes32 _attributeHash,
        bytes32 _validationHash
    ) public view returns (Validation memory) {
        return
            users[_user].attributes[_attributeHash].validations[
                _validationHash
            ];
    }

    function getPublicKey(address _user) public view returns (bytes32) {
        return users[_user].publicKey;
    }
}
