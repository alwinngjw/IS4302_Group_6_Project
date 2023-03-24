const ERC20 = artifacts.require("ERC20");
const AvaxToken = artifacts.require("Avax");
const Reserves = artifacts.require("Reserves");
const LiquidityPool = artifacts.require("LiquidityPool");
const Lending = artifacts.require("Lending");
const PriceFeed = artifacts.require("PriceFeed");
const WalletFeed = artifacts.require("WalletFeed");
const IdentityToken = artifacts.require("IdentityToken");
const Identity = artifacts.require("Identity");
const IdentityMarket = artifacts.require("IdentityMarket");

/*
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
*/

module.exports = (deployer, network, accounts) => {
    deployer.then(async() => {
        await deployer.deploy(AvaxToken);
        await deployer.deploy(IdentityToken);
        await deployer.deploy(Identity);
        await deployer.deploy(PriceFeed);
        await deployer.deploy(WalletFeed);
        await deployer.deploy(Reserves, AvaxToken.address);
        await deployer.deploy(LiquidityPool, AvaxToken.address, Reserves.address);
        await deployer.deploy(Lending, AvaxToken.address, LiquidityPool.address, Reserves.address, PriceFeed.address, IdentityToken.address);
        await deployer.deploy(IdentityMarket, Identity.address, Lending.address, WalletFeed.address, IdentityToken.address);
    });
};