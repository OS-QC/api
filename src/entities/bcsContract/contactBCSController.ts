import {
  Controller,
  SuccessResponse,
  // Post,
  // Body,
  Route,
  Tags,
  Get,
} from 'tsoa'
// import axios from 'axios'
import UniswapService from '@entities/web3/uniswapService'

@Route('contractBCS')
@Tags('ContractBCS')
export class contactBCSController extends Controller {
  private uniswapService: typeof UniswapService
  constructor() {
    super()
    this.uniswapService = UniswapService
  }

  /**
   * Verificar contrato.
   * @param pRequestBody - Parámetros de consulta de contrato.
   * @returns success para verificar respuesta, data del contrato, y mensaje.
   */
  @SuccessResponse('201', 'Created') // Custom success response
  @Get('/all')
  public async all(): Promise<{ success: boolean, data: any | null; token?: string; message?: any }> {
    try {
      // let headersList = {
      //   "Accept": "*/*",
      //   "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      //   "apikey": "1d96080a0d2400fbbd" 
      //  }
      //  let reqOptions = {
      //   url: "https://api.dodoex.io/swap_data/pairs",
      //   method: "GET",
      //   headers: headersList,
      // }
      // const dodo = await axios.request(reqOptions)

      const data = await this.uniswapService.pancakeswapData()
      this.setStatus(200)
      return { success: true, data, message: 'success' }
    } catch (error) {
      console.log('dio error', error);
      this.setStatus(400) // HTTP 401 Unauthorized
      return { success: false, data: null, message: 'Ocurrio un error' }
    }
  }

}