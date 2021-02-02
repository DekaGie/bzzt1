import Config from './Config'
import DbConnector from './db/Connector'
import ServiceLocator from './ServiceLocator'
import ServerStarter from './web/ServerStarter'
import BzzBotFactory from './service/BzzBotFactory'
import FbClient from './fb/impl/FbClient'

class App {
  static start (config: Config): Promise<void> {
    const locator: ServiceLocator = new ServiceLocator()
    locator.fbClient.provide(new FbClient(config.accessToken))
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
