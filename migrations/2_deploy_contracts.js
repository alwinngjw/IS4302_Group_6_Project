const ERC20 = artifacts.require("ERC20");
const USDCToken = artifacts.require("USDC");
const Reserves = artifacts.require("Reserves");
const LiquidityPool = artifacts.require("LiquidityPool");

module.exports = (deployer, network, accounts) => {
    deployer.deploy(USDCToken).then(function() {
        return deployer.deploy(Reserves, USDCToken.address).then(function() {
            return deployer.deploy(LiquidityPool, USDCToken.address, Reserves.address);
        })
    })
};