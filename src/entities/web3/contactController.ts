import {
  Controller,
  SuccessResponse,
  Post,
  Body,
  Route,
  Tags,
  Get,
  Queries
} from 'tsoa'
import { web3 } from 'app'
import axios from 'axios'
import AppConfig from '@config/AppConfig'
import { EExchange } from '@type/type'
// import { DEFAULT_RETURN_FORMAT, ETH_DATA_FORMAT } from 'web3'
import { DEFAULT_RETURN_FORMAT } from 'web3'
// import * as cheerio from 'cheerio';
// import puppeteer from 'puppeteer';
// import UniswapService from './uniswapService'
import HardhatService from './hardhatService'
import ContractService from './contractServiceBNBAave'
import ContractService2 from './contractServiceBNBAave2'
// TODO esto no funciona import * as CoinMarketCap from 'node-coinmarketcap-rest-api'

@Route('contract')
@Tags('Contract')
export class contactController extends Controller {
  // private uniswapService: typeof UniswapService
  private hardhatService: typeof HardhatService
  private contractService: typeof ContractService
  private contractService2: typeof ContractService2
  constructor() {
    super()
    // this.uniswapService = UniswapService
    this.hardhatService = HardhatService
    this.contractService = ContractService
    this.contractService2 = ContractService2
  }

  /**
   * Verificar contrato.
   * @param pRequestBody - Parámetros de consulta de contrato.
   * @returns success para verificar respuesta, data del contrato, y mensaje.
   */
    @SuccessResponse('201', 'Created') // Custom success response
    @Post('/contact')
    public async contact(
      @Body() requestBody: any
    ): Promise<{ success: boolean, data: any | null; token?: string; message?: any }> {
      try {
        console.log('requestBody :>> ', requestBody)
        // TODO el abi es el contrato pero en array?
        const abi = [
          {
              "constant": false,
              "inputs": [
                  {"name": "_to", "type": "address"},
                  {"name": "_value", "type": "uint256"}
              ],
              "name": "transfer",
              "outputs": [{"name": "", "type": "bool"}],
              "type": "function"
          }
      ]
        const contract = new web3.eth.Contract(abi, AppConfig.USDT_CONTRACT_ADDRESS, { data: requestBody.bytecode })
        const deployedContract = await contract.deploy().send({
          from: AppConfig.ETH_ADDRESS,
          gas: requestBody?.limit_gas || '3000000',
        })
        this.setStatus(200)
        return { success: true, data: deployedContract, message: 'success' }
      } catch (error) {
        console.log('error :>> ', error)
        this.setStatus(400) // HTTP 401 Unauthorized
        return { success: false, data: null, message: 'Ocurrio un error' }
      }
    }

  /**
   * Verificar contrato.
   * @param pRequestBody - Parámetros de consulta de contrato.
   * @returns success para verificar respuesta, data del contrato, y mensaje.
   */
    @SuccessResponse('201', 'Created') // Custom success response
    @Get('/all')
    public async all(
      @Queries() pQueryParams: { init: string, amount: number, type: EExchange }
    ): Promise<{ success: boolean, data: any | null; token?: string; message?: any }> {
      try {
        const init = pQueryParams.init
        // const end = pQueryParams.end
        const amount = pQueryParams.amount
        console.log('pQueryParams.type :>> ', pQueryParams.type);
        const ratesEnd: IRatesEnd[] = []
        if (pQueryParams.type === EExchange.UNISWAP) {
          const hola = await this.hardhatService.getDexPrices()
          console.log('hola :>> ', hola);
          return { success: true, data: 'Vuelva mas tarde' , message: 'success' }
        }
        // if (pQueryParams.type === EExchange.UNISWAP) {
        //   console.log('hola');
        //   const result: any[] = [];
        //   // const uniswapData = await this.uniswapService.data()
        //   // return { success: true, data: { ratesEnd: uniswapData }, message: 'success' }
        //   const browser = await puppeteer.launch();
        //   const page = await browser.newPage();
        //   await page.goto('https://app.uniswap.org/explore', { waitUntil: 'networkidle2' })
        //   await page.waitForSelector('#root');
        //   const content = await page.content();
        //   // console.log('content :>> ', content);
          
        //   console.log('ya estamos en response');
        //   const document = cheerio.load(content);
        //   console.log('Antes de buscar');
        //   document('div[data-testid="top-tokens-explore-table"]').each((index, element) => {
        //     console.log('_index :>> ', index)
        //     console.log('element :>> ', element)
        //     const value = document(element).find('div[data-testid="price-cell"] > span').text()
        //     console.log('value :>> ', value);
        //     result.push(value);
        //   });
        //   await browser.close();

        //   return { success: true, data: { ratesEnd: result }, message: 'success' }
        // }
        if (pQueryParams.type === EExchange.COINGECKO) {
          const rates: { id: string, name: string, rate?: number, usd: number }[] = [
            {
              id: "BTC",
              name: "bitcoin",
              rate: 0,
              usd: 0
            },
            {
              id: "ETH",
              name: "ethereum",
              rate: 0,
              usd: 0
            },
            {
              id: "USDT",
              name: "tether",
              rate: 0,
              usd: 0
            },
          ]
          const apiUrl = 'https://api.coingecko.com/api/v3/simple/price';
          const response = await axios.get(apiUrl, {
              params: {
                  ids: rates.map((cripto) => cripto.name).join(','),
                  vs_currencies: 'usd',
                  api_key: '',
              },
          });
          const responseRates = response.data
          for (const cryptoId in responseRates) {
            if (responseRates.hasOwnProperty(cryptoId)) {
              const index = rates.findIndex((item) => item.name === cryptoId)
              rates[index].usd = responseRates[cryptoId].usd;
              rates[index].usd = responseRates[cryptoId].usd;
            }
          }
          console.log('rates.findIndex((item) => item.id === init) :>> ', rates.findIndex((item) => item.id === init));
          if (rates[rates.findIndex((item) => item.id === init)]) {
            const ratesInit = rates[rates.findIndex((item) => item.id === init)].usd
            console.log('ratesInit :>> ', ratesInit);
            for (const rate of rates) {
              if (rate.name !== init) {
                const exchangeRate = rate.usd;
                const rateEnd = exchangeRate * ratesInit;
                rate.rate = rateEnd
              }
            }
          }
          return { success: true, data: { ratesEnd: rates }, message: 'success' }
        }
        if (pQueryParams.type === EExchange.COINMARKETCAP) {
          // cryptocurrency/quotes/latest
          // const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH,USDT'
          const url = 'https://pro-api.coinmarketcap.com/v1/exchange/market-pairs/latest'
          const response = await axios.get(url, {
            headers: {
              'X-CMC_PRO_API_KEY': '59515341-af9d-49fa-bc6f-c44e241d9288',
            },
          });
          console.log('response.data :>> ', response.data);
          return { success: true, data: response.data.data, message: 'success' }
        }
        const response = await axios.get(`${AppConfig[pQueryParams.type]}`)
        const rates = response.data.data.rates
        interface IRatesEnd {
          id: string,
          rate: number,
          USD: number
        }
        const ratesInit = parseFloat(rates[init]) * amount
        for (const key in rates) {
          if (key !== init) {
            const exchangeRate = rates[key];
            const rateEnd = parseFloat(exchangeRate) * ratesInit;
            ratesEnd.push({
              id: key,
              rate: rateEnd,
              USD: exchangeRate
            })
          }
        }
        this.setStatus(200)
        return { success: true, data: { ratesEnd }, message: 'success' }
      } catch (error) {
        console.log('dio error', error);
        this.setStatus(400) // HTTP 401 Unauthorized
        return { success: false, data: null, message: 'Ocurrio un error' }
      }
    }

    @SuccessResponse('200', 'Ok')
    @Get('/block')
    public async block(): Promise<{ success: boolean, data: any | null; token?: string; message?: any }> {
      try {
        const block = await web3.eth.getBlockNumber()
        console.log('block :>> ', block);
        return { success: true, data: "ok", message: 'success' }
      } catch (error) {
        console.log('dio error');
        this.setStatus(400) // HTTP 401 Unauthorized
        return { success: false, data: null, message: 'Ocurrio un error' }
      }
    }

    @SuccessResponse('200', 'Ok')
    @Get('/transaction')
    public async transaction(): Promise<{ success: boolean, data: any | null; token?: string; message?: any }> {
      try {
        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
      
        let balance1, balance2;
        //The initial balances of the accounts should be 100 Eth (10^18 wei)
        balance1 = await web3.eth.getBalance(accounts[0]);
        balance2 = await web3.eth.getBalance(accounts[1]);
      
        console.log(balance1, balance2);
      
        //create a transaction sending 1 Ether from account 0 to account 1
        const transaction = {
          from: accounts[0],
          to: accounts[1],
          // value should be passed in wei. For easier use and to avoid mistakes,
          //	we utilize the auxiliary `toWei` function:
          value: web3.utils.toWei('1', 'ether'),
        };
      
        //send the actual transaction
        const transactionHash = await web3.eth.sendTransaction(transaction);
        console.log('transactionHash', transactionHash);
      
        balance1 = await web3.eth.getBalance(accounts[0]);
        balance2 = await web3.eth.getBalance(accounts[1]);
      
        // see the updated balances
        console.log(balance1, balance2);
      
        // irrelevant with the actual transaction, just to know the gasPrice
        const gasPrice = await web3.eth.getGasPrice();
        console.log('gasPrice :>>', gasPrice);
        return { success: true, data: { gasPrice: gasPrice.toString() }, message: 'success' }
      } catch (error) {
        console.log('dio error');
        this.setStatus(400) // HTTP 401 Unauthorized
        return { success: false, data: null, message: 'Ocurrio un error' }
      }
    }

    @SuccessResponse('200', 'Ok')
    @Get('/estimatedGas')
    public async estimatedGas(): Promise<{ success: boolean, data: any | null; token?: string; message?: any }> {
      try {
        // abi of our contract
        const abi = [
          {
            inputs: [{ internalType: 'uint256', name: '_myNumber', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'constructor',
          },
          {
            inputs: [],
            name: 'myNumber',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [{ internalType: 'uint256', name: '_myNumber', type: 'uint256' }],
            name: 'setMyNumber',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ];

        //get the available accounts
        const accounts = await web3.eth.getAccounts();
        let acc = await accounts[0];

        let contract = new web3.eth.Contract(abi);

        const deployment = contract.deploy({
          data: '0x608060405234801561001057600080fd5b506040516101d93803806101d983398181016040528101906100329190610054565b806000819055505061009e565b60008151905061004e81610087565b92915050565b60006020828403121561006657600080fd5b60006100748482850161003f565b91505092915050565b6000819050919050565b6100908161007d565b811461009b57600080fd5b50565b61012c806100ad6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806323fd0e401460375780636ffd773c146051575b600080fd5b603d6069565b6040516048919060bf565b60405180910390f35b6067600480360381019060639190608c565b606f565b005b60005481565b8060008190555050565b60008135905060868160e2565b92915050565b600060208284031215609d57600080fd5b600060a9848285016079565b91505092915050565b60b98160d8565b82525050565b600060208201905060d2600083018460b2565b92915050565b6000819050919050565b60e98160d8565b811460f357600080fd5b5056fea2646970667358221220d28cf161457f7936995800eb9896635a02a559a0561bff6a09a40bfb81cd056564736f6c63430008000033',
          arguments: [1],
        });

        let estimatedGas: any = await deployment.estimateGas({ from: acc }, DEFAULT_RETURN_FORMAT);
        // the returned data will be formatted as a bigint

        console.log('Default format:', estimatedGas);

        // estimatedGas = await deployment.estimateGas({ from: acc }, ETH_DATA_FORMAT);
        // the returned data will be formatted as a hexstring

        console.log('Eth format:', estimatedGas);
        return { success: true, data: { gasPrice: estimatedGas.toString() }, message: 'success' }
      } catch (error) {
        console.log('dio error');
        this.setStatus(400) // HTTP 401 Unauthorized
        return { success: false, data: null, message: 'Ocurrio un error' }
      }
    }

    @SuccessResponse('200', 'Ok')
    @Get('/loanOne')
    public async loanOne(): Promise<{ success: boolean, data: any | null; token?: string; message?: any }> {
      try {
        const erc20Address = '0xAbF916751042250E3015003da5CfB93028dAC15a' // Dirección del contrato ERC20
        const erc20ABI = [
          {
            inputs: [{ internalType: 'uint256', name: '_myNumber', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'constructor',
          },
          {
            inputs: [],
            name: 'myNumber',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [{ internalType: 'uint256', name: '_myNumber', type: 'uint256' }],
            name: 'setMyNumber',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ]
        const erc20Contract = new web3.eth.Contract(erc20ABI, erc20Address)
        console.log('erc20Contract :>> ', erc20Contract)
        // erc20Contract.
        return { success: true, data: "algo deberia pasar", message: 'success' }
      } catch (error) {
        console.log('dio error');
        this.setStatus(400) // HTTP 401 Unauthorized
        return { success: false, data: null, message: 'Ocurrio un error' }
      }
    }

    @SuccessResponse('200', 'Ok')
    @Post('/dinamicContract')
    public async dinamicContract(@Body() requestBody: { amount: string }): Promise<{ success: boolean, data: any | null; token?: string; message?: any }> {
      try {
        const contract = await this.contractService.main(requestBody.amount)
        console.log('contract :>> ', contract)
        return { success: true, data: "Ya interactuo", message: 'success' }
      } catch (error) {
        console.log('dio error');
        this.setStatus(400) // HTTP 401 Unauthorized
        return { success: false, data: null, message: 'Ocurrio un error' }
      }
    }

    @SuccessResponse('200', 'Ok')
    @Post('/dinamicContract2')
    public async dinamicContract2(@Body() requestBody: { amount: string }): Promise<{ success: boolean, data: any | null; token?: string; message?: any }> {
      try {
        const contract = await this.contractService2.main(requestBody.amount)
        console.log('contract :>> ', contract)
        return { success: true, data: "Ya interactuo", message: 'success' }
      } catch (error) {
        console.log('dio error');
        this.setStatus(400) // HTTP 401 Unauthorized
        return { success: false, data: null, message: 'Ocurrio un error' }
      }
    }
    
}