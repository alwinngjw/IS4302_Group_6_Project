const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions"); //npm install truffle-assertions
var assert = require("assert");
const attributeHash1 =
  "0x7465737400000000000000000000000000000000000000000000000000000000";
const attributeHash2 =
  "0x6869000000000000000000000000000000000000000000000000000000000000";
const validationHash1 =
  "0x696c6f7665697334333032000000000000000000000000000000000000000000";
const publicKey =
  "0x7075626c69636b65790000000000000000000000000000000000000000000000";

var Identity = artifacts.require("../contracts/Identity.sol");

contract("Identity", function (accounts) {
  before(async () => {
    identityInstance = await Identity.deployed();
  });

  console.log("Testing Identity Contract");

  //1. Testing that identity can be created
  it("1. Testing that Identity can be created", async () => {
    let createIdentity = await identityInstance.createIdentity({
      from: accounts[1],
    });

    const identityAddress = await identityInstance.getOwner(accounts[1]);
    truffleAssert.eventEmitted(createIdentity, "IdentityIssued");

    assert.strictEqual(
      identityAddress,
      accounts[1],
      "Identity's owner does not match account address"
    );
  });

  //2. Testing that attribute cannot be added to non-existent identity
  it("2. Testing that attribute cannot be added to non-existent identity", async () => {
    await truffleAssert.reverts(
      identityInstance.addAttribute(attributeHash1, { from: accounts[2] }),
      "Please create an identity first!"
    );
  });

  //3. Testing that attribute can be added by owner
  it("3. Testing that attribute can be added by owner", async () => {
    let addAttribute = await identityInstance.addAttribute(attributeHash1, {
      from: accounts[1],
    });
    const attributeHash = await identityInstance.getAttribute(
      accounts[1],
      attributeHash1
    );

    truffleAssert.eventEmitted(addAttribute, "AttributeAdded");
    assert.strictEqual(
      attributeHash,
      attributeHash1,
      "Incorrect Attribute Hash"
    );
  });

  //4. Testing that duplicate attribute cannot be added
  it("4. Testing that duplicate attribute cannot be added", async () => {
    await truffleAssert.reverts(
      identityInstance.addAttribute(attributeHash1, { from: accounts[1] }),
      "Attribute hash already present in mapping"
    );
  });

  //5. Testing that invalid attribute hash cannot be updated
  it("5. Testing that invalid attribute hash cannot be updated", async () => {
    await truffleAssert.reverts(
      identityInstance.updateAttribute(attributeHash2, attributeHash1, {
        from: accounts[1],
      }),
      "Attribute hash not present in mapping"
    );
  });

  //6. Testing that attribute can be updated
  it("6. Testing that attribute can be updated", async () => {
    let updateAttribute = await identityInstance.updateAttribute(
      attributeHash1,
      attributeHash2,
      {
        from: accounts[1],
      }
    );
    const attributeHash = await identityInstance.getAttribute(
      accounts[1],
      attributeHash2
    );

    truffleAssert.eventEmitted(updateAttribute, "AttributeUpdated");
    assert.strictEqual(
      attributeHash,
      attributeHash2,
      "Incorrect Attribute Hash"
    );
  });

  //7. Testing that validation can be added
  it("7. Testing that validation can be added", async () => {
    let addValidation = await identityInstance.addValidation(
      accounts[1],
      attributeHash2,
      validationHash1
    );

    const validation = await identityInstance.getValidation(
      accounts[1],
      attributeHash2,
      validationHash1
    );

    truffleAssert.eventEmitted(addValidation, "ValidationAdded");
    assert.strictEqual(
      validation.validator,
      accounts[0],
      "Incorrect validator"
    );
    assert.strictEqual(
      validation.hash,
      validationHash1,
      "Incorrect validation hash"
    );
  });

  //8. Testing that owner cannot add validation to their own identity
  it("8. Testing that owner cannot add validation to their own identity", async () => {
    await truffleAssert.reverts(
      identityInstance.addValidation(
        accounts[1],
        attributeHash2,
        validationHash1,
        { from: accounts[1] }
      ),
      "Owners cannot create/remove validations"
    );
  });

  //9. Testing that validation can only be added to valid hash
  it("9. Testing that validation can only be added to valid hash", async () => {
    await truffleAssert.reverts(
      identityInstance.addValidation(
        accounts[1],
        attributeHash1,
        validationHash1
      ),
      "Attribute hash not present in mapping"
    );
  });

  //10 Testing that duplicate validation hash cannot be added to attribute
  it("10 Testing that duplicate validation hash cannot be added to attribute", async () => {
    await truffleAssert.reverts(
      identityInstance.addValidation(
        accounts[1],
        attributeHash2,
        validationHash1
      ),
      "Validation hash already present"
    );
  });

  //11. Testing that validation can be accepted by owner
  it("11. Testing that validation can be accepted by owner", async () => {
    let acceptValidation = await identityInstance.acceptValidation(
      attributeHash2,
      validationHash1,
      { from: accounts[1] }
    );

    const validation = await identityInstance.getValidation(
      accounts[1],
      attributeHash2,
      validationHash1
    );

    truffleAssert.eventEmitted(acceptValidation, "ValidationAccepted");
    assert.strictEqual(validation.accepted, true, "Validation not accepted");
  });
  //12. Testing that validation cannot be removed by unauthorised user
  it("12. Testing that validation cannot be removed by unauthorised user", async () => {
    await truffleAssert.reverts(
      identityInstance.removeValidation(
        accounts[1],
        attributeHash2,
        validationHash1,
        { from: accounts[2] }
      ),
      "You are not authorised to remove validation as you are not the validator"
    );
  });
  //13. Testing that validation cannot be removed by owner
  it("13. Testing that validation cannot be removed by owner", async () => {
    await truffleAssert.reverts(
      identityInstance.removeValidation(
        accounts[1],
        attributeHash2,
        validationHash1,
        { from: accounts[1] }
      ),
      "Owners cannot create/remove validations"
    );
  });
  //14. Testing that validation can be removed by authorised user
  it("14. Testing that validation can be removed by authorised user", async () => {
    let removeValidation = await identityInstance.removeValidation(
      accounts[1],
      attributeHash2,
      validationHash1
    );

    const validation = await identityInstance.getValidation(
      accounts[1],
      attributeHash2,
      validationHash1
    );
    truffleAssert.eventEmitted(removeValidation, "ValidationRemoved");
    assert.strictEqual(
      validation.hash,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "Validation not removed"
    );
  });

  //15. Testing that attribute can be removed by owner
  it("15. Testing that attribute can be removed by owner", async () => {
    let removeAttribute = await identityInstance.removeAttribute(
      attributeHash2,
      { from: accounts[1] }
    );

    const attributeHash = await identityInstance.getAttribute(
      accounts[1],
      attributeHash2
    );
    truffleAssert.eventEmitted(removeAttribute, "AttributeRemoved");
    assert.strictEqual(
      attributeHash,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "Attribute not removed"
    );
  });
  //16. Testing that public key cannot be set to non-existent identity
  it("16. Testing that public key cannot be set to non-existent identity", async () => {
    await truffleAssert.reverts(
      identityInstance.setPublicKey(publicKey, { from: accounts[2] }),
      "Please create an identity first!"
    );
  });
  //17 Testing that public key can be set by owner
  it("17. Testing that public key can be set by owner", async () => {
    let setPublicKey = await identityInstance.setPublicKey(publicKey, {
      from: accounts[1],
    });

    const newPublicKey = await identityInstance.getPublicKey(accounts[1]);
    truffleAssert.eventEmitted(setPublicKey, "PublicKeySet");
    assert.strictEqual(newPublicKey, publicKey, "Public key not set correctly");
  });
});