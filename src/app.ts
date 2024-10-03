import express, {json, urlencoded} from 'express'
import { RegisterRoutes } from './routes/routes'
import swaggerUi from 'swagger-ui-express'
import * as swaggerDocument from './swagger.json'
import { errorHandler } from './middlewares/errorHandler'
import { expressAuthentication } from './middlewares/expressAuthentication'
// import AppConfig from './config/AppConfig'
import Web3 from 'web3'
import { ethers } from 'ethers'

export const app = express();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
// export const web3 = new Web3(AppConfig.PROVIDER_CONTEXT)
// export const web3 = new Web3(new Web3.providers.HttpProvider(AppConfig.GANACHE_RUL))
export const web3 = new Web3('https://mainnet.infura.io/v3/c2e9d6cf71624ba6bed24a6aa2081b80')
web3.eth.net.isListening()
  .then(() => console.log('Connected to the network'))
  .catch((error) => console.error('Failed to connect to the network:', error));
export const provider = new ethers.JsonRpcProvider('http://localhost:7545')
const address = '0xAbF916751042250E3015003da5CfB93028dAC15a'
console.log('address :>> ', address);
provider.getBalance(address).then((balance: any) => {
  console.log(`Saldo de ${address}: ${ethers.formatEther(balance)} ETH`);
});
// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json())
app.use(expressAuthentication)

RegisterRoutes(app)
app.use(errorHandler)
