import express, { Application } from 'express'
import { Server } from 'http'
import ServiceLocator from '../ServiceLocator'
import FbMessengerPlatform from '../fb/FbMessengerPlatform'
import Config from '../Config'
import ExpressEndpointFactory from '../http/ExpressEndpointFactory'
import PrivacyPolicyServlet from './PrivacyPolicyServlet'
import VerificationServlet from './VerificationServlet'
import ErrorFilter from './ErrorFilter'
import MessagingServlet from './MessagingServlet'

class ServerStarter {
  static start (config: Config, locator: ServiceLocator): Promise<Server> {
    const application: Application = express()

    const endpoints: ExpressEndpointFactory = new ExpressEndpointFactory()
      .filter(new ErrorFilter())

    application.get(
      '/hello',
      endpoints.servlet(new PrivacyPolicyServlet())
    )

    application.get(
      '/webhook',
      endpoints.servlet(new VerificationServlet(config.verifyToken))
    )

    application.post(
      '/webhook',
      endpoints.servlet(
        new MessagingServlet(
          new FbMessengerPlatform(
            locator.fbClient.refer(),
            locator.bot.refer()
          )
        )
      )
    )

    return new Promise(
      (resolve, reject) => {
        const server: Server = application.listen(config.port)
        server.on('error', reject)
        server.on('listening', () => resolve(server))
      }
    )
  }
}

export default ServerStarter
