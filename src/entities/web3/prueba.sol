// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoExchange {
    mapping(string => string[]) private dexToCryptos;

    constructor() {
        dexToCryptos["Uniswap"] = ["ETH", "USDT", "DAI"];
        dexToCryptos["PancakeSwap"] = ["BNB", "BUSD", "CAKE"];
    }

    function getAvailableOptions(string memory dexName) public view returns (string[] memory) {
        return dexToCryptos[dexName];
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniswapV2Router {
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
}

contract DexPriceFetcher {
    address public uniswapRouter;
    address public sushiswapRouter;

    constructor(address _uniswapRouter, address _sushiswapRouter) {
        uniswapRouter = _uniswapRouter;
        sushiswapRouter = _sushiswapRouter;
    }

    function getPrices(address tokenIn, address tokenOut, uint amountIn) external view returns (uint uniswapPrice, uint sushiswapPrice) {
        address[] memory path = new address;
        path[0] = tokenIn;
        path[1] = tokenOut;

        uint[] memory uniswapAmounts = IUniswapV2Router(uniswapRouter).getAmountsOut(amountIn, path);
        uint[] memory sushiswapAmounts = IUniswapV2Router(sushiswapRouter).getAmountsOut(amountIn, path);

        uniswapPrice = uniswapAmounts[1];
        sushiswapPrice = sushiswapAmounts[1];
    }
}