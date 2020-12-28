import * as express from 'express'

class App {
  public express

  constructor () {
    this.express = express()
    this.mountRoutes()
  }

  private mountRoutes (): void {
    const router = express.Router()
    router.get('/hello', (req, res) => {
      res.json({
        message: 'Hello World! 5'
      })
    })
    this.express.use('/', router)
  }
}

export default new App().express
