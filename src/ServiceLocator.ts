import { Server } from 'http'
import { Connection } from 'typeorm'
import ServiceSlot from './ServiceSlot'
import BzzBot from './service/BzzBot'
import FbClient from './fb/impl/FbClient'

class ServiceLocator {
  readonly db: ServiceSlot<Connection>

  readonly web: ServiceSlot<Server>

  readonly bot: ServiceSlot<BzzBot>;

  readonly fbClient: ServiceSlot<FbClient>;

  constructor () {
    this.db = new ServiceSlot()
    this.web = new ServiceSlot()
    this.bot = new ServiceSlot()
    this.fbClient = new ServiceSlot()
  }
}

export default ServiceLocator
