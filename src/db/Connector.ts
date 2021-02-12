import { Connection, createConnection } from 'typeorm'
import Config from '../Config'
import CardDbo from './dbo/CardDbo'
import CardRegistrationDbo from './dbo/CardRegistrationDbo'
import AgreementDbo from './dbo/AgreementDbo'
import SalonDbo from './dbo/SalonDbo'
import SalonRegistrationDbo from './dbo/SalonRegistrationDbo'
import IdentificationDbo from './dbo/IdentificationDbo'
import PackageDbo from './dbo/PackageDbo'
import TreatmentDbo from './dbo/TreatmentDbo'

class Connector {
  static connect (config: Config): Promise<Connection> {
    return createConnection(
      {
        type: 'postgres',
        url: config.postgresUrl,
        entities: [
          AgreementDbo,
          CardDbo,
          CardRegistrationDbo,
          IdentificationDbo,
          PackageDbo,
          SalonDbo,
          SalonRegistrationDbo,
          TreatmentDbo
        ],
        synchronize: true,
        logging: false
      }
    )
  }
}

export default Connector
