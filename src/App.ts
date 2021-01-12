import express, { Application } from 'express'
import Config from './Config'
import VerificationServlet from './VerificationServlet'
import ExpressEndpointFactory from './http/ExpressEndpointFactory'
import ErrorFilter from './ErrorFilter'
import PrivacyPolicyServlet from './PrivacyPolicyServlet'
import MessagingServlet from './MessagingServlet'
import FbClient from './fb/FbClient'
import BarcodeParser from './service/BarcodeParser'
import CardChecker from './service/CardChecker'
import OcrSpace from './ocr/OcrSpace'

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
          new BarcodeParser(new OcrSpace(config.ocrSpaceApiKey)),
          new CardChecker(),
          new FbClient(config.accessToken)
        )
      )
    )

    return new Promise((resolve) => application.listen(config.port, resolve))
  }
}

export default App
