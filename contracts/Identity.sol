// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Identity {
    address public owner;
    string public publicKey;
    mapping(bytes32 => Attribute) public attributes;

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
        address validator; // entity validating endorsement
        bytes32 hash;
        bool accepted; // true if user accepts the validation
    }

    event IdentityIssued(address _from);
    event AttributeAdded(address _owner, bytes32 _hash);
    event AttributeRemoved(address _owner, bytes32 _hash);
    event AttributeUpdated(address _owner, bytes32 _oldHash, bytes32 _newHash);
    event ValidationAdded(address _owner, address validator, bytes32 attributeHash);
    event ValidationRemoved(address _owner, bytes32 attributeHash);
    event ValidationAccepted(address _owner, bytes32 attributeHash, bytes32 validationHash);

    event PublicKeySet(string _publicKey);

    constructor () {
        owner = msg.sender;
    }

    modifier ownerOnly() {
        require(msg.sender == owner); 
        _;
    }

    function addAttribute(bytes32 _hash) public ownerOnly() {
        require(attributes[_hash].hash == 0, "Attribute hash already present in mapping");

        Attribute storage newAttribute = attributes[_hash];
        newAttribute.hash = _hash;
        
        emit AttributeAdded(owner, _hash);
    }

    function removeAttribute(bytes32 _hash) public ownerOnly() {
        require(attributes[_hash].hash == _hash, "Attribute hash not present in mapping");

        delete(attributes[_hash]);

        emit AttributeRemoved(owner, _hash);
    }

    function updateAttribute(bytes32 _oldHash, bytes32 _newHash) public ownerOnly() returns(bool) {
        require(attributes[_oldHash].hash == _oldHash, "Attribute hash not present in mapping");

        removeAttribute(_oldHash);
        addAttribute(_newHash);

        emit AttributeUpdated(owner, _oldHash, _newHash); 
        return true;
    }

    function addValidation(bytes32 attributeHash, bytes32 validationHash) public {
        Attribute storage attribute = attributes[attributeHash];
        require(attribute.hash == attributeHash, "Attribute hash not present in mapping");
        Validation memory validation = attribute.validations[validationHash];
        require(validation.hash == 0, "Validation hash already present"); 

        validation.hash = validationHash;
        validation.accepted = false;
        validation.validator = msg.sender;

        emit ValidationAdded(owner, msg.sender, attributeHash);
    }

    function removeValidation(bytes32 attributeHash, bytes32 validationHash) public {
        Attribute storage attribute = attributes[attributeHash]; 
        Validation memory validation = attribute.validations[validationHash];
        require(validation.hash == validationHash, "Validation hash is not present");  
        require(msg.sender == validation.validator, "You are not authorised to remove validation as you are not the validator");

        delete attribute.validations[validationHash];

        emit ValidationRemoved(owner, attributeHash);
    }

    function acceptValidation(bytes32 attributeHash, bytes32 validationHash) public {
        Attribute storage attribute = attributes[attributeHash];
        Validation memory validation = attribute.validations[validationHash];

        validation.accepted = true;

        emit ValidationAccepted(owner, attributeHash, validationHash);
    }

    function setPublicKey(string memory _publicKey) public ownerOnly() {
        publicKey = _publicKey;

        emit PublicKeySet(_publicKey);
    }

}