import { Client } from '@elastic/elasticsearch'

class EsIndex {
  private readonly client: Client;

  private readonly name: string;

  constructor (client: Client, name: string) {
    this.client = client
    this.name = name
  }

  insert (document: object): Promise<void> {
    return this.client.index(
      {
        index: 'logs',
        body: document
      }
    ).then(
      (result) => {}
    )
  }
}

export default EsIndex
