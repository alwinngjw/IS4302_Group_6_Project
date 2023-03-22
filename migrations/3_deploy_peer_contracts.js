const ERC20 = artifacts.require("ERC20");
const Oraculum = artifacts.require("Oraculum");
const BeetCoin = artifacts.require("BeetCoin");
const EternumCoin = artifacts.require("EternumCoin");
const SolarisCoin = artifacts.require("SolarisCoin");
const PeerToken = artifacts.require("PeerToken");
const PeerExchangeOrder = artifacts.require("PeerExchangeOrder");

module.exports = (deployer, network, accounts) => {
    deployer.then(async() => {
        await deployer.deploy(ERC20);
        await deployer.deploy(Oraculum);
        await deployer.deploy(BeetCoin, Oraculum.address);
        await deployer.deploy(EternumCoin, Oraculum.address);
        await deployer.deploy(SolarisCoin, Oraculum.address);
        await deployer.deploy(PeerToken);
        await deployer.deploy(PeerExchangeOrder, ERC20.address, BeetCoin.address, EternumCoin.address, 
                                SolarisCoin.address, PeerToken.address, Oraculum.address);
    });
};