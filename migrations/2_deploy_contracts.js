const ERC20 = artifacts.require("ERC20");
const AvaxToken = artifacts.require("Avax");
const Reserves = artifacts.require("Reserves");
const LiquidityPool = artifacts.require("LiquidityPool");
const Lending = artifacts.require("Lending");
const PriceFeed = artifacts.require("PriceFeed");

module.exports = (deployer, network, accounts) => {
    deployer.deploy(AvaxToken).then(function() {
        return deployer.deploy(Reserves, AvaxToken.address).then(function() {
            return deployer.deploy(LiquidityPool, AvaxToken.address, Reserves.address).then(function() {
                return deployer.deploy(PriceFeed).then(function() {
                    return deployer.deploy(Lending, AvaxToken.address, LiquidityPool.address, Reserves.address, PriceFeed.address);
                });
            });
        })
    })
};