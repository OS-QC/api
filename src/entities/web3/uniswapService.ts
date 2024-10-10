import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { gql } from 'graphql-tag'
// https://open-platform.nodereal.io/86ed2590874c439e9615cd6258ffbd7b/pancakeswap-free/graphql
// https://docs.nodereal.io/reference/pancakeswap-graphql-api#example
// https://nodereal.io/api-marketplace/explore
class UniswapService {
  async data(): Promise<any> {
    try {
      const client = new ApolloClient({
        link: new HttpLink({
          uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
        }),
        cache: new InMemoryCache(),
      });
      const GET_TOKEN_DETAILS = gql`
        query GetTokenDetails {
          tokens {
            id
            name
            symbol
            derivedETH
          }
        }
      `;
      // Ejecuta la consulta
      console.log('antes de data');
      const data = await new Promise((resolve, reject) => {
        console.log('En data');
        client.query({ query: GET_TOKEN_DETAILS })
          .then((result) => {
            console.log('en result');
            const tokens = result.data.tokens
            console.log('tokens :>> ', tokens)
            resolve(resolve)
            // tokens.forEach((token: any) => {
            //   console.log(`Nombre: ${token.name}, Símbolo: ${token.symbol}, Valor en ETH: ${token.derivedETH}`);
            // });
          })
          .catch(error => {
            console.log('error :>> ', error);
            reject(error)
          });
      });
      return data
    } catch (error) {
      throw error
    }

  }
  async pancakeswapData(): Promise<any> {
    try {
      const client = new ApolloClient({
        link: new HttpLink({
          uri: 'https://open-platform.nodereal.io/86ed2590874c439e9615cd6258ffbd7b/pancakeswap-free/graphql',
        }),
        cache: new InMemoryCache(),
      });
      const GET_TOKEN_DETAILS = gql`
        {
          pairDayDatas( first: 2, skip: 0,  
          where: { date_gt: 1659312000,
                  pairAddress: "0xfffEEb211f1595C9f8f009e3C25E9d20FCd3ce12"})
            { 
              pairAddress{
                  id
                  name
              }
              date
              dailyVolumeUSD
              dailyTxns
              dailyVolumeToken0
              dailyVolumeToken1
              reserve0
              reserve1
              reserveUSD
              totalSupply
          }
        }
      `;
      // Ejecuta la consulta
      console.log('antes de data');
      const data = await new Promise((resolve, reject) => {
        console.log('En data');
        client.query({ query: GET_TOKEN_DETAILS })
          .then((result) => {
            console.log('en result', result.data);
            const tokens = result.data
            console.log('tokens :>> ', tokens)
            resolve(result.data)
            // tokens.forEach((token: any) => {
            //   console.log(`Nombre: ${token.name}, Símbolo: ${token.symbol}, Valor en ETH: ${token.derivedETH}`);
            // });
          })
          .catch(error => {
            console.log('error :>> ', error);
            reject(error)
          });
      });
      return data
    } catch (error) {
      throw error
    }
  }
}
export default new UniswapService()