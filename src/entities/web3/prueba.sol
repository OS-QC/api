// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoExchange {
    mapping(string => string[]) private dexToCryptos;

    constructor() {
        // Inicializar algunos datos de ejemplo
        dexToCryptos["Uniswap"] = ["ETH", "USDT", "DAI"];
        dexToCryptos["PancakeSwap"] = ["BNB", "BUSD", "CAKE"];
        // ... otros DEX y criptomonedas
    }

    function getAvailableOptions(string memory dexName) public view returns (string[] memory) {
        return dexToCryptos[dexName];
    }
}
