import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { gql } from 'graphql-tag'

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
}
export default new UniswapService()