const ERC20 = artifacts.require("ERC20");
const USDCToken = artifacts.require("USDC");

module.exports = (deployer, network, accounts) => {
    deployer.deploy(USDCToken)
};