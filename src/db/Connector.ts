import { Connection, createConnection } from 'typeorm'
import Config from '../Config'
import CardDbo from './dbo/CardDbo'
import CardRegistrationDbo from './dbo/CardRegistrationDbo'
import AgreementDbo from './dbo/AgreementDbo'

class Connector {
  static connect (config: Config): Promise<Connection> {
    return createConnection(
      {
        type: 'postgres',
        url: config.postgresUrl,
        entities: [
          AgreementDbo,
          CardDbo,
          CardRegistrationDbo
        ],
        synchronize: true,
        logging: false
      }
    )
  }
}

export default Connector
