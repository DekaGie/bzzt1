import express, { Application } from 'express'
import Config from './Config'
import VerificationServlet from './VerificationServlet'
import ExpressEndpointFactory from './http/ExpressEndpointFactory'
import ErrorFilter from './ErrorFilter'
import PrivacyPolicyServlet from './PrivacyPolicyServlet'
import MessagingServlet from './MessagingServlet'
import FbMessengerPlatform from './fb/FbMessengerPlatform'
import FbClient from './fb/impl/FbClient'
import BzzBot from './BzzBot'
import OcrSpace from './ocr/OcrSpace'
import Decoder39 from './code39/Decoder39'
import BarcodeParser from './service/BarcodeParser'
import BzzCustomerCare from './service/BzzCustomerCare'

class App {
  static start (config: Config): Promise<void> {
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
            new FbClient(config.accessToken),
            new BzzBot(
              new BzzCustomerCare(
                new BarcodeParser(new Decoder39(), new OcrSpace(config.ocrSpaceApiKey))
              )
            )
          )
        )
      )
    )

    return new Promise((resolve) => application.listen(config.port, resolve))
  }
}

export default App
