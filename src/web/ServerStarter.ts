import express, { Application } from 'express'
import cors from 'cors'
import { Server } from 'http'
import ServiceLocator from '../ServiceLocator'
import FbMessengerPlatform from '../fb/FbMessengerPlatform'
import Config from '../Config'
import ExpressEndpointFactory from '../http/ExpressEndpointFactory'
import PrivacyPolicyServlet from './PrivacyPolicyServlet'
import VerificationServlet from './VerificationServlet'
import ErrorFilter from './ErrorFilter'
import MessagingServlet from './MessagingServlet'
import ApiSafeErrorFilter from './api/ApiSafeErrorFilter'
import SalonTreatmentsServlet from './api/SalonTreatmentsServlet'
import SalonCardHolderServlet from './api/SalonCardHolderServlet'
import SalonVisitServlet from './api/SalonVisitServlet'
import SalonAuthenticationServlet from './api/SalonAuthenticationServlet'

class ServerStarter {
  static start (config: Config, locator: ServiceLocator): Promise<Server> {
    const application: Application = express().use(cors())

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

    const api: ExpressEndpointFactory = endpoints.filter(new ApiSafeErrorFilter())
    application.post(
      '/salons/authenticate',
      api.servlet(new SalonAuthenticationServlet(locator.fbClient.refer()))
    )
    application.get(
      '/salons/me/treatments',
      api.servlet(new SalonTreatmentsServlet(locator.db.refer()))
    )
    application.get(
      '/salons/me/card_holder/:card_number',
      api.servlet(new SalonCardHolderServlet(locator.db.refer()))
    )
    application.post(
      '/salons/me/card_holder/:card_number/visit',
      api.servlet(new SalonVisitServlet(locator.db.refer()))
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
