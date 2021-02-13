import { Server } from 'http'
import { Connection } from 'typeorm'
import ServiceSlot from './ServiceSlot'
import BzzBot from './service/BzzBot'
import FbClient from './fb/impl/FbClient'
import StateStore from './service/StateStore'
import BarcodeParser from './service/api/BarcodeParser'
import EsClient from './es/EsClient'

class ServiceLocator {
  readonly db: ServiceSlot<Connection>

  readonly web: ServiceSlot<Server>

  readonly bot: ServiceSlot<BzzBot>;

  readonly fbClient: ServiceSlot<FbClient>;

  readonly barcodes: ServiceSlot<BarcodeParser>;

  readonly states: ServiceSlot<StateStore>;

  readonly es: ServiceSlot<EsClient>;

  constructor () {
    this.db = new ServiceSlot()
    this.es = new ServiceSlot()
    this.web = new ServiceSlot()
    this.bot = new ServiceSlot()
    this.fbClient = new ServiceSlot()
    this.barcodes = new ServiceSlot()
    this.states = new ServiceSlot()
  }
}

export default ServiceLocator
