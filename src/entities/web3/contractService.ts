// import { web3 } from 'app';
import { ethers } from 'ethers'
import AppConfig from '@config/AppConfig';

// Configuración de la red y el proveedor
const provider = new ethers.InfuraProvider('mainnet', AppConfig.INFURA_API_KEY);
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
class ContractService {
    public async main(pTokenAddress: string, pAmount: number): Promise<boolean> {
      try {
        const amount = ethers.parseUnits(pAmount.toString(), 18);
        const tx = await contract.requestFlashLoan(pTokenAddress, amount);
        console.log(`Transacción enviada: ${tx.hash}`);
        await tx.wait();
        console.log('Préstamo flash solicitado con éxito');
    
        // Verificar el balance del contrato
        const balance = await contract.getBalance(pTokenAddress);
        console.log(`Balance del contrato: ${ethers.formatUnits(balance, 18)} tokens`);
    
        // Retirar tokens (solo propietario)
        const withdrawTx = await contract.withdraw(pTokenAddress);
        console.log(`Transacción de retiro enviada: ${withdrawTx.hash}`);
        await withdrawTx.wait();
        console.log('Tokens retirados con éxito');
        contract.getFunction
        // address[] memory exchanges = new address;
        // exchanges[0] = address(exchange1);
        // exchanges[1] = address(exchange2);

        // bytes[] memory data = new bytes;
        // data[0] = abi.encodeWithSignature("swap(address,uint256)", tokenAddress, amount);
        // data[1] = abi.encodeWithSignature("swap(address,uint256)", tokenAddress, amount);

        // bytes memory params = abi.encode(exchanges, data);

        // // Solicitar el préstamo flash
        // flashLoanArbitrage.requestFlashLoan(tokenAddress, amount, params);
        return true
      } catch (error) {
        throw error
      }
    }
}
export default new ContractService()