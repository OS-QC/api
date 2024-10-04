import { ethers } from 'ethers';
//import AppConfig from '@config/AppConfig';
import AppConfig from '../../config/AppConfig.ts';


// Configuración de la red y el proveedor
const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
const wallet = new ethers.Wallet(AppConfig.PRIVATE_KEY, provider);

// Dirección del contrato y ABI
const contractAddress = AppConfig.CONTRACT_ADDRESS;
const abi = [
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
const contract = new ethers.Contract(contractAddress, abi, wallet);

// Variables para los valores del swap
const tokenAddress = "0x0000000000000000000000000000000000000000"; // Dirección del token BNB
const amount = ethers.parseUnits("1", 18); // 500 BNB en unidades
const exchanges = ["0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2", "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"]; // Direcciones de los exchanges
const swapData = [
    ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", amount]),
    ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", amount])
];

class ContractService {
    public async main() {
        // Parámetros de arbitraje
        const params = ethers.AbiCoder.defaultAbiCoder().encode(["address[]", "bytes[]"], [exchanges, swapData]);

        // Solicitar un préstamo flash
        const tx = await contract.requestFlashLoan(tokenAddress, amount, params);
        console.log(`Transacción enviada: ${tx.hash}`);
        await tx.wait();
        console.log('Préstamo flash solicitado con éxito');
    
        // Verificar el balance del contrato
        const balance = await contract.getBalance(tokenAddress);
        console.log(`Balance del contrato: ${ethers.formatUnits(balance, 18)} tokens`);
    
        // Retirar tokens (solo propietario)
        const withdrawTx = await contract.withdraw(tokenAddress);
        console.log(`Transacción de retiro enviada: ${withdrawTx.hash}`);
        await withdrawTx.wait();
        console.log('Tokens retirados con éxito');
    }
}

export default new ContractService();
