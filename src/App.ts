import Config from './Config'
import DbConnector from './db/Connector'
import ServiceLocator from './ServiceLocator'
import ServerStarter from './web/ServerStarter'
import BzzBotFactory from './service/BzzBotFactory'
import FbClient from './fb/impl/FbClient'
import Decoder39 from './code39/Decoder39'
import OcrSpace from './ocr/OcrSpace'
import StateStore from './service/StateStore'
import BarcodeParser from './service/api/BarcodeParser'
import Loggers from './log/Loggers'
import EsLoggerBackend from './log/EsLoggerBackend'
import EsClient from './es/EsClient'
import ConsoleLoggerBackend from './log/ConsoleLoggerBackend'
import BroadcastLoggerBackend from './log/BroadcastLoggerBackend'
import Logger from './log/Logger'

class App {
  private static readonly LOG: Logger = Loggers.get(App.name);

  static start (config: Config): Promise<void> {
    App.LOG.info(`starting with ${JSON.stringify(config)}`)
    const esClient: EsClient = new EsClient(config.esUrl)
    Loggers.initialize(
      new BroadcastLoggerBackend(
        new EsLoggerBackend(esClient, new ConsoleLoggerBackend()),
        new ConsoleLoggerBackend()
      )
    )
    const locator: ServiceLocator = new ServiceLocator()
    locator.es.provide(esClient)
    locator.fbClient.provide(new FbClient(config.accessToken))
    locator.barcodes.provide(new BarcodeParser(new Decoder39(), new OcrSpace(config.ocrSpaceApiKey)))
    locator.states.provide(new StateStore())
    return DbConnector.connect(config)
      .then((db) => locator.db.provide(db))
      .then(
        () => locator.bot.provide(
          BzzBotFactory.create(config, locator)
        )
      )
      .then(
        () => ServerStarter.start(config, locator)
          .then((web) => locator.web.provide(web))
      )
  }
}

export default App
