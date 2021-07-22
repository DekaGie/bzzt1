import { Connection, createConnection } from 'typeorm'
import Config from '../Config'
import CardDbo from './dbo/CardDbo'
import CardRegistrationDbo from './dbo/CardRegistrationDbo'
import AgreementDbo from './dbo/AgreementDbo'
import SalonDbo from './dbo/SalonDbo'
import SalonRegistrationDbo from './dbo/SalonRegistrationDbo'
import IdentificationDbo from './dbo/IdentificationDbo'
import TreatmentDbo from './dbo/TreatmentDbo'
import PacketDbo from './dbo/PacketDbo'
import AgreementPacketDbo from './dbo/AgreementPacketDbo'
import SalonTreatmentDbo from './dbo/SalonTreatmentDbo'
import TreatmentExecutionDbo from './dbo/TreatmentExecutionDbo'
import SalonWorkerDbo from './dbo/SalonWorkerDbo'

class Connector {
  static connect (config: Config): Promise<Connection> {
    return createConnection(
      {
        type: 'postgres',
        url: config.postgresUrl,
        entities: [
          AgreementDbo,
          AgreementPacketDbo,
          CardDbo,
          CardRegistrationDbo,
          IdentificationDbo,
          PacketDbo,
          SalonDbo,
          SalonRegistrationDbo,
          SalonWorkerDbo,
          SalonTreatmentDbo,
          TreatmentDbo,
          TreatmentExecutionDbo
        ],
        synchronize: true,
        logging: false
      }
    )
  }
}

export default Connector
