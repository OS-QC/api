import { ethers } from 'ethers';
import AppConfig from '@config/AppConfig';
const pancakeSwapAbi = require('./abis/pancakeSwapAbi.json');
const dodoAbi = require('./abis/dodoAbi.json');

// Configuración del proveedor y la cuenta
const provider = new ethers.JsonRpcProvider('https://bsc-dataseed3.binance.org/');
const wallet = new ethers.Wallet(AppConfig.PRIVATE_KEY, provider);

// Dirección del contrato de FlashLoan desplegado
const flashLoanAddress = AppConfig.CONTRACT_ADDRESS;

// ABI del contrato de FlashLoan
const flashLoanABI: any = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_addressProvider",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "ContractDeployed",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "ADDRESSES_PROVIDER",
        "outputs": [
            {
                "internalType": "contract IPoolAddressesProvider",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "POOL",
        "outputs": [
            {
                "internalType": "contract IPool",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "premium",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "initiator",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "params",
                "type": "bytes"
            }
        ],
        "name": "executeOperation",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenAddress",
                "type": "address"
            }
        ],
        "name": "getBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "requestFlashLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenAddress",
                "type": "address"
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
];

// Direcciones de los contratos de los intercambios
const pancakeSwapAddress = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';
const dodoAddress = '0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2';
const tokenAddress = "0x570a5d26f7765ecb712c0924e4de545b89fd43df";

class ContractService {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private flashLoanContract: ethers.Contract;
    private pancakeSwapContract: ethers.Contract;
    private dodoContract: ethers.Contract;

    constructor() {
        this.provider = new ethers.JsonRpcProvider('https://bsc-dataseed3.binance.org/');
        this.wallet = new ethers.Wallet(AppConfig.PRIVATE_KEY, this.provider);
        this.flashLoanContract = new ethers.Contract(AppConfig.CONTRACT_ADDRESS, flashLoanABI, this.wallet);
        this.pancakeSwapContract = new ethers.Contract(pancakeSwapAddress, pancakeSwapAbi, this.wallet);
        this.dodoContract = new ethers.Contract(dodoAddress, dodoAbi, this.wallet);
    }

    public async main(pAmount: string): Promise<boolean> {
        try {
            const amount = ethers.parseUnits(pAmount || "1", 18);
            const mybalance = await this.provider.getBalance(this.wallet.address);
            console.log(`Balance: ${ethers.formatEther(mybalance)} BNB`);
            console.log('amount :>> ', amount);

            const swapData = [
                ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", amount]),
                ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", amount])
            ];
            const params = ethers.AbiCoder.defaultAbiCoder().encode(["address[]", "bytes[]"], [[dodoAddress, pancakeSwapAddress], swapData]);
            console.log("Params:", params);

            let gasEstimate;
            try {
                gasEstimate = await this.flashLoanContract.requestFlashLoan.estimateGas(tokenAddress, amount, params);
                console.log(`Gas estimado: ${gasEstimate.toString()}`);
            } catch (error) {
                console.log('Error en la estimación del gas, forzando la transacción:', error);
                gasEstimate = BigInt('5000000'); // Establecer un límite de gas predeterminado
            }

            const feeData = await this.provider.getFeeData();
            const gasPrice = feeData.gasPrice;
            if (!gasPrice) {
                throw new Error('No se pudo obtener el precio del gas');
            }
            console.log(`Precio del gas: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);

            const gasEstimateBN = BigInt(gasEstimate.toString());
            const gasPriceBN = BigInt(gasPrice.toString());
            const txCost = gasEstimateBN * gasPriceBN;
            console.log(`Costo total de la transacción: ${ethers.formatUnits(txCost.toString(), 'ether')} BNB`);

            const balanceBNB = BigInt(mybalance.toString());
            if (balanceBNB < txCost) {
                throw new Error('Fondos insuficientes para cubrir el costo de la transacción');
            } else {
                console.log('Fondos suficientes para cubrir el costo de la transacción');
            }

            const tx: ethers.TransactionRequest = {
                from: this.wallet.address,
                to: AppConfig.CONTRACT_ADDRESS,
                gasLimit: ethers.toBeHex(gasEstimate),
                gasPrice: gasPrice,
                data: this.flashLoanContract.interface.encodeFunctionData('requestFlashLoan', [tokenAddress, amount, params])
            };

            const sentTx = await this.wallet.sendTransaction(tx);
            console.log(`Transacción enviada: ${sentTx.hash}`);
            await sentTx.wait();
            console.log('Préstamo flash solicitado con éxito');

            const balance = await this.flashLoanContract.getBalance(tokenAddress);
            console.log(`Balance del contrato: ${ethers.formatUnits(balance, 18)} tokens`);

            const withdrawTx = await this.flashLoanContract.withdraw(tokenAddress, {
                gasLimit: ethers.toBeHex(gasEstimate),
                gasPrice: gasPrice,
                from: this.wallet.address
            });
            console.log(`Transacción de retiro enviada: ${withdrawTx.hash}`);
            await withdrawTx.wait();
            console.log('Tokens retirados con éxito');
            return true;
        } catch (error: any) {
            if (error.code === 'CALL_EXCEPTION') {
                console.log('Error en la solicitud de préstamo flash:', error);
            } else if (error.code === 'NETWORK_ERROR') {
                console.log('Error de red, reintentando la conexión:', error);
            } else {
                console.log('Error inesperado:', error);
            }
            return false;
        }
    }
}

export default new ContractService();
