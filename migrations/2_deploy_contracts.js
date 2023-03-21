const ERC20 = artifacts.require("ERC20");
const BeetCoin = artifacts.require("BeetCoin");
const SolarisCoin = artifacts.require("SolarisCoin");
const PeerExchangeOrder = artifacts.require("PeerExchangeOrder");

module.exports = (deployer, network, accounts) => {
    deployer.then(async() => {
        await deployer.deploy(ERC20);
        await deployer.deploy(BeetCoin);
        await deployer.deploy(SolarisCoin);
        await deployer.deploy(PeerExchangeOrder, ERC20.address, BeetCoin.address, SolarisCoin.address);
    });
};