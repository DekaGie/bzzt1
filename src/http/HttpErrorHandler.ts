import { Request, Response } from 'express-serve-static-core'
import { NextFunction } from 'express'
import HttpError from './HttpError'

class HttpErrorHandler {
  static handle (req: Request, res: Response, next: NextFunction): void {
    try {
      console.log('handle called')
      next()
      console.log('handle success')
    } catch (error) {
      console.log(`handle error: ${error}`)
      if (!(error instanceof HttpError)) {
        console.log(typeof error)
        console.log(error instanceof Error)
        throw error
      }
      res.status(error.code).send(error.detail)
    }
  }
}

export default HttpErrorHandler
