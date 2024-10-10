import Web3 from 'web3'
import AppConfig from '@config/AppConfig'

const web3 = new Web3('https://bsc-dataseed3.binance.org/');
const account = web3.eth.accounts.privateKeyToAccount(AppConfig.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

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
const contract = new web3.eth.Contract(abi, contractAddress);

class ContractService2 {
    constructor() {
    }

    public async main(pAmount: string): Promise<boolean> {
        try {
            const amount = web3.utils.toWei(pAmount, 'ether');
            const gasPrice = await web3.eth.getGasPrice();
            const gasLimit = 5000000; // Estimación de gas

            const params = web3.eth.abi.encodeParameters(
                ['address[]', 'bytes[]'],
                [
                    ["0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2", "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"],
                    [
                        web3.eth.abi.encodeParameters(['address', 'uint256'], ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", amount]),
                        web3.eth.abi.encodeParameters(['address', 'uint256'], ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", amount])
                    ]
                ]
            );

            const data = contract.methods.requestFlashLoan(
                "0xB8c77482e45F1F44dE1745F52C74426C631bDD52", // tokenAddress
                amount,
                params
            ).encodeABI();

            const tx = {
                from: account.address,
                to: contractAddress,
                gas: gasLimit,
                gasPrice: gasPrice,
                data: data
            };

            const signedTx = await web3.eth.accounts.signTransaction(tx, AppConfig.PRIVATE_KEY);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

            console.log('Transacción enviada:', receipt.transactionHash);
            return true
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

export default new ContractService2();
