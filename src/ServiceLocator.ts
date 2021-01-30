import { Server } from 'http'
import { Connection } from 'typeorm'
import ServiceSlot from './ServiceSlot'
import BzzBot from './service/BzzBot'

class ServiceLocator {
  readonly db: ServiceSlot<Connection>

  readonly web: ServiceSlot<Server>

  readonly bot: ServiceSlot<BzzBot>;

  constructor () {
    this.db = new ServiceSlot()
    this.web = new ServiceSlot()
    this.bot = new ServiceSlot()
  }
}

export default ServiceLocator
