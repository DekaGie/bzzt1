import { NextFunction, Request, Response } from 'express-serve-static-core'
import HttpServlet from './HttpServlet'
import UrlQuery from './UrlQuery'

class ExpressServletAdapter {
  private readonly servlet: HttpServlet

  constructor (servlet: HttpServlet) {
    this.servlet = servlet
  }

  handle (req: Request, res: Response, next: NextFunction): void {
    this.servlet.handle(
      {
        query: new UrlQuery(req.query)
      }
    ).then(
      (response) => {
        res.status(response.code)
        if (response.body instanceof Object) {
          res.contentType('application/json').json(response.body)
        } else if (response.body !== undefined) {
          res.contentType('text/plain').send(response.body)
        }
      },
      next
    )
  }
}

export default ExpressServletAdapter
