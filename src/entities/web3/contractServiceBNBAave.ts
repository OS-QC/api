import { ethers } from 'ethers';
import AppConfig from '@config/AppConfig';
import Web3 from 'web3';

// Configuración de la red y el proveedor
const web3 = new Web3('https://bsc-dataseed3.binance.org/');
const provider = new ethers.JsonRpcProvider('https://bsc-dataseed3.binance.org/');
const wallet = new ethers.Wallet(AppConfig.PRIVATE_KEY, provider);

// Dirección del contrato y ABI
const contractAddress = AppConfig.CONTRACT_ADDRESS;
const abi: any = [
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
const tokenAddress = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52"; // Dirección del token BNB
const exchanges = ["0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2", "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"]; // Direcciones de los exchanges

class ContractService {
    public async main(pAmount: string): Promise<boolean> {
        try {
            // Solicitar un préstamo flash
            const amount = ethers.parseUnits(pAmount || "1", 18);
            const mybalance = await web3.eth.getBalance(wallet.address);
            console.log(`Balance: ${web3.utils.fromWei(mybalance, 'ether')} BNB`);
            console.log('amount :>> ', amount);
            const swapData = [
                ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", amount]),
                ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", amount])
            ];
            const params = ethers.AbiCoder.defaultAbiCoder().encode(["address[]", "bytes[]"], [exchanges, swapData]);
            console.log("Params:", params);

            // Estimar el gas necesario
            let gasEstimate;
            try {
                gasEstimate = await contract.requestFlashLoan.estimateGas(tokenAddress, amount);
                console.log(`Gas estimado: ${gasEstimate.toString()}`);
            } catch (error) {
                console.log('Error en la estimación del gas, forzando la transacción:', error);
                gasEstimate = BigInt('5000000'); // Establecer un límite de gas predeterminado
            }

            // Obtener el precio del gas
            const feeData = await provider.getFeeData();
            const gasPrice = feeData.gasPrice;
            if (!gasPrice) {
                throw new Error('No se pudo obtener el precio del gas');
            }
            console.log(`Precio del gas: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);

            // Convertir a BigInt para operaciones matemáticas
            const gasEstimateBN = BigInt(gasEstimate.toString());
            const gasPriceBN = BigInt(gasPrice.toString());

            // Calcular el costo total de la transacción
            const txCost = gasEstimateBN * gasPriceBN;
            console.log(`Costo total de la transacción: ${ethers.formatUnits(txCost.toString(), 'ether')} BNB`);

            // Verificar si hay fondos suficientes
            const balanceBNB = BigInt(mybalance);
            if (balanceBNB < txCost) {
                throw new Error('Fondos insuficientes para cubrir el costo de la transacción');
            }

            // Enviar la transacción
            const tx = await contract.requestFlashLoan(tokenAddress, amount, {
                gasLimit: ethers.toBeHex(gasEstimate),
                gasPrice: gasPrice
            });

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
            return true;
        } catch (error) {
            console.log('Error en la solicitud de préstamo flash:', error);
            return false; // Asegúrate de devolver un valor booleano en caso de error
        }
    }
}

export default new ContractService();
