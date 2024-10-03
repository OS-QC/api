import { web3 } from 'app';
import { ethers } from 'ethers'
// import { Contract } from 'ethers'
// import axios from 'axios'
// const hre = require('hardhat')
// import * as hre from 'hardhat'

const UNISWAP_ROUTER_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const SUSHISWAP_ROUTER_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'
class HarhatService {
  // async data(): Promise<any> {
  //   // Estos valores pueden ser generados dinámicamente por tu API
  //   const usdtTokenAddress = process.env.USDT_TOKEN_ADDRESS || '0x1234567890abcdef1234567890abcdef12345678';
  //   const usdtFlashTokenAddress = process.env.USDT_FLASH_TOKEN_ADDRESS || '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef';
  //   const dexAddress = process.env.DEX_ADDRESS || '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
  //   const tokenIn = process.env.TOKEN_IN || '0xabcdefabcdefabcdefabcdefabcdefabcdefab';
  //   const tokenOut = process.env.TOKEN_OUT || '0xabcdefabcdefabcdefabcdefabcdefabcdefac';
  //   const poolFee = process.env.POOL_FEE || 3000; // 0.3%
  //   const swapAmount = hre.ethers.utils.parseUnits(process.env.SWAP_AMOUNT || '1000', 18); // 1000 tokens

  //   const FlashLoanWithArbitrage = await hre.ethers.getContractFactory('FlashLoanWithArbitrage');
  //   const flashLoanContract = await FlashLoanWithArbitrage.deploy(
  //     usdtTokenAddress,
  //     usdtFlashTokenAddress,
  //     dexAddress,
  //     tokenIn,
  //     tokenOut,
  //     poolFee,
  //     swapAmount
  //   );

  //   await flashLoanContract.deployed();

  //   console.log('FlashLoanWithArbitrage deployed to:', flashLoanContract.address);
  // }
  async getDexPrices(): Promise<any> {
    try {
      const ABI = [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_uniswapRouter",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_sushiswapRouter",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "tokenIn",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "tokenOut",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amountIn",
              "type": "uint256"
            }
          ],
          "name": "getPrices",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "uniswapPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sushiswapPrice",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "sushiswapRouter",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "uniswapRouter",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
      const uniswapRouter = new web3.eth.Contract(ABI, UNISWAP_ROUTER_ADDRESS)
      const sushiswapRouter = new web3.eth.Contract(ABI, SUSHISWAP_ROUTER_ADDRESS)
      const amountIn = web3.utils.toWei('1', 'ether')
      const path = ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48']

      const uniswapAmounts: any = await uniswapRouter.methods.getPrices(amountIn, path).call()
      const sushiswapAmounts: any = await sushiswapRouter.methods.getPrices(amountIn, path).call()
      console.log('uniswapAmounts :>> ', uniswapAmounts)
      console.log('sushiswapAmounts :>> ', sushiswapAmounts)
      if (uniswapAmounts && sushiswapAmounts && uniswapAmounts.length && sushiswapAmounts.length) {
        const uniswapRate = web3.utils.fromWei(uniswapAmounts[1], 'ether')
        const sushiswapRate = web3.utils.fromWei(sushiswapAmounts[1], 'ether')
        return { uniswapRate, sushiswapRate }
      }
      return { uniswapRate: false, sushiswapRate: false }

    } catch (error) {
      console.log('error :>> ', error);
    }
  }
  async getRates(): Promise<any> {
    // const [deployer] = await ethers.getSigners();
    // ethers.Signature
    // Uniswap

    const uniswapRouter = new ethers.Contract(
      UNISWAP_ROUTER_ADDRESS,
      [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'
      ],
      ethers.getDefaultProvider()
    );
  
    // SushiSwap
    const sushiswapRouter = new ethers.Contract(
      SUSHISWAP_ROUTER_ADDRESS,
      [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'
      ],
      ethers.getDefaultProvider()
    );
  
    const amountIn = ethers.parseUnits('1', 18); // 1 token
    const path = ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48']; // Token addresses
    // console.log('uniswapRouter :>> ', uniswapRouter.);
    const sushiswapAmounts = await sushiswapRouter.getAmountsOut(amountIn, path);
    console.log('SushiSwap Rate:', ethers.formatUnits(sushiswapAmounts[1], 18));

    const uniswapAmounts = await uniswapRouter.getAmountsOut(amountIn, path);
  
    console.log('Uniswap Rate:', ethers.formatUnits(uniswapAmounts[1], 18));
    return true
  }
}
export default new HarhatService()