import Config from './Config'
import DbConnector from './db/Connector'
import ServiceLocator from './ServiceLocator'
import ServerStarter from './web/ServerStarter'
import BzzBotFactory from './service/BzzBotFactory'

class App {
  static start (config: Config): Promise<void> {
    const locator: ServiceLocator = new ServiceLocator()
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
