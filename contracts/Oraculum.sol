// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Oraculum {

    uint256 valueBeetCoin;
    uint256 valueEternumCoin;
    uint256 valueSolarisCoin;

    // Stimulating an Oracle for the latest market value of currencies available
    // For demonstration purposes, new values will be statically created (instead of dynamic)
    // Values are based on 1 Peer Token

    constructor() {
        valueBeetCoin = 10000;      // 1 BeetCoin == 10 ETH == 10000 PeerToken
        valueEternumCoin = 1000;    // 1 EternumCoin == 1 ETH == 1000 PeerToken
        valueSolarisCoin = 10;      // 1 SolarisCoin == 0.01 ETH == 10 PeerToken
    }

    event NewValuation();

    function queryNewValuations() public {
        // Demonstrates increase in value
        valueBeetCoin = 1 * 15000;

        // Demonstrates no change in value
        valueEternumCoin = 1 * 1000;

        // Demonstrates decreases in value
        valueSolarisCoin = 1 * 5;

        emit NewValuation();
    }

    /* Getter Methods For Ratio Between Currencies */

    function ratioBCEC() public view returns (uint256) {
        return valueBeetCoin / valueEternumCoin;
    }

    function ratioBCSC() public view returns (uint256) {
        return valueBeetCoin / valueSolarisCoin;
    }

    function ratioECSC() public view returns (uint256) {
        return valueEternumCoin / valueSolarisCoin;
    }

    /* Get Methods For Testing */
    
    // BeetCoin
    function queryCurrentBCValue() public view returns (uint256) {
        return valueBeetCoin;
    }

    // EternumCoin 
    function queryCurrentECValue() public view returns (uint256) {
        return valueEternumCoin;
    }

    // SolarisCoin
    function queryCurrentSCValue() public view returns (uint256) {
        return valueSolarisCoin;
    }
    
}