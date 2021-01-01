import express, { Application } from 'express'
import Config from './Config'
import VerificationServlet from './VerificationServlet'
import ExpressEndpointFactory from './http/ExpressEndpointFactory'
import ErrorFilter from './ErrorFilter'
import PrivacyPolicyServlet from './PrivacyPolicyServlet'

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

    return new Promise((resolve) => application.listen(config.port, resolve))
  }
}

export default App
