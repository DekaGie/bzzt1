import { Client } from '@elastic/elasticsearch'
import { Optional } from 'typescript-optional'
import EsIndex from './EsIndex'

class EsClient {
  private readonly client: Client;

  constructor (urlString: string) {
    const url: URL = new URL(urlString)
    this.client = new Client(
      {
        node: `${url.protocol}//${url.host}:${Optional.ofNullable(url.port).orElse('80')}${url.pathname}`,
        auth: {
          username: url.username,
          password: url.password
        }
      }
    )
  }

  createIndex (name: string, mapping: object): Promise<EsIndex> {
    return this.client.indices.create(
      {
        index: name,
        body: {
          mappings: {
            properties: mapping
          }
        }
      }
    ).catch(
      (error) => {
        if (error.message === 'resource_already_exists_exception') {
          return new EsIndex(this.client, name)
        }
        throw error
      }
    ).then(
      (result) => new EsIndex(this.client, name)
    )
  }
}

export default EsClient
