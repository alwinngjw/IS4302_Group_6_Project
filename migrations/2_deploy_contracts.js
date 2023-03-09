const ERC20 = artifacts.require("ERC20");
const AvaxToken = artifacts.require("Avax");
const Reserves = artifacts.require("Reserves");
const LiquidityPool = artifacts.require("LiquidityPool");

module.exports = (deployer, network, accounts) => {
    deployer.deploy(AvaxToken).then(function() {
        return deployer.deploy(Reserves, AvaxToken.address).then(function() {
            return deployer.deploy(LiquidityPool, AvaxToken.address, Reserves.address);
        })
    })
};