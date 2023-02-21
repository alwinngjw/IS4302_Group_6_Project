const ERC20 = artifacts.require("ERC20");
const USDCToken = artifacts.require("USDC");



/*
module.exports = (deployer , network, accounts) => {
    deployer.deploy(Dice).then(() => deployer.deploy(DiceToken).then(() => deployer.deploy(DiceMarketDT, Dice.address, DiceToken.address, 1)));
}
*/

module.exports = (deployer, network, accounts) => {
    deployer.deploy(USDCToken)
};