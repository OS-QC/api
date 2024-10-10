import {
  Controller,
  SuccessResponse,
  // Post,
  // Body,
  Route,
  Tags,
  Get,
} from 'tsoa'
import arbitrajeJSON from '@entities/arbitration/arbitraje.json'

interface Dex {
  name: string;
  pairs: { pair: string; price: number }[];
}

interface DexData {
  dexes: Dex[];
}

interface ArbitrageOpportunity {
  pair: string;
  buyDex: string;
  sellDex: string;
  buyPrice: number;
  sellPrice: number;
  profitPercentage: number;
}
@Route('arbitration')
@Tags('Arbitration')
export class arbitrationController extends Controller {
  constructor() {
    super()
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
      const data = this.calculateArbitrageOpportunities(arbitrajeJSON)
      this.setStatus(200)
      return { success: true, data: data, message: 'success' }
    } catch (error) {
      console.log('dio error', error);
      this.setStatus(400) // HTTP 401 Unauthorized
      return { success: false, data: null, message: 'Ocurrio un error' }
    }
  }

  public calculateArbitrageOpportunities(data: DexData): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];

    for (const dex1 of data.dexes) {
      for (const pair1 of dex1.pairs) {
        for (const dex2 of data.dexes) {
          if (dex1.name !== dex2.name) {
            const pair2 = dex2.pairs.find(p => p.pair === pair1.pair);
            if (pair2 && pair1.price < pair2.price) {
              const profitPercentage = ((pair2.price - pair1.price) / pair1.price) * 100;
              opportunities.push({
                pair: pair1.pair,
                buyDex: dex1.name,
                sellDex: dex2.name,
                buyPrice: pair1.price,
                sellPrice: pair2.price,
                profitPercentage: profitPercentage
              });
            }
          }
        }
      }
    }

    return opportunities;
  }
}