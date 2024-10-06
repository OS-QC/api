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
const flashLoanABI : any = [
    // ABI del contrato FlashLoan
];

// Instancia del contrato de FlashLoan
const flashLoanContract = new ethers.Contract(flashLoanAddress, flashLoanABI, wallet);

// Direcciones de los contratos de los intercambios
const pancakeSwapAddress = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';
const dodoAddress = '0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2';

// Instancias de los contratos de los intercambios
const pancakeSwapContract = new ethers.Contract(pancakeSwapAddress, pancakeSwapAbi, wallet);
const dodoContract = new ethers.Contract(dodoAddress, dodoAbi, wallet);

// Función para ejecutar el flash loan y arbitraje
async function executeFlashLoanAndArbitrage() {
  const asset = '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'; // Dirección del token BNB
  const amount = ethers.parseUnits('1', 18); // 1 BNB
  const params = ethers.AbiCoder.defaultAbiCoder().encode(
    ['address[]', 'bytes[]'],
    [
      [dodoAddress, pancakeSwapAddress], // Direcciones de los intercambios
      [
        // Datos de las transacciones de arbitraje (reemplaza con datos reales)
        dodoContract.interface.encodeFunctionData('swapExactTokensForTokens', [
          amount,
          ethers.parseUnits('0.9', 18), // Mínimo de tokens a recibir
          ['0xB8c77482e45F1F44dE1745F52C74426C631bDD52', '0x...'], // Ruta de intercambio
          wallet.address,
          Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutos desde ahora
        ]),
        pancakeSwapContract.interface.encodeFunctionData('swapExactTokensForTokens', [
          amount,
          ethers.parseUnits('0.9', 18), // Mínimo de tokens a recibir
          ['0xB8c77482e45F1F44dE1745F52C74426C631bDD52', '0x...'], // Ruta de intercambio
          wallet.address,
          Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutos desde ahora
        ])
      ]
    ]
  );

  try {
    const tx = await flashLoanContract.requestFlashLoan(asset, amount, params);
    console.log('Transacción enviada:', tx.hash);
    await tx.wait();
    console.log('Transacción confirmada:', tx.hash);
  } catch (error) {
    console.error('Error al ejecutar el flash loan y arbitraje:', error);
  }
}

// Ejecutar el flash loan y arbitraje
executeFlashLoanAndArbitrage()
  .then(() => console.log('Flash loan y arbitraje ejecutados con éxito'))
  .catch((error) => console.error('Error al ejecutar el script:', error));
