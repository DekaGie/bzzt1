import { NextFunction, Request, Response } from 'express-serve-static-core'
import HttpServlet from './HttpServlet'
import UrlQuery from './UrlQuery'
import Predicates from '../util/Predicates'
import RequestBody from './RequestBody'
import UrlPath from './UrlPath'

class ExpressServletAdapter {
  private readonly servlet: HttpServlet

  constructor (servlet: HttpServlet) {
    this.servlet = servlet
  }

  handle (req: Request, res: Response, next: NextFunction): void {
    ExpressServletAdapter.readBody(req)
      .then(
        (body) => this.servlet.handle(
          {
            path: new UrlPath(req.params),
            query: new UrlQuery(req.query),
            body: new RequestBody(body)
          }
        )
      )
      .then(
        (response) => {
          res.status(response.code)
          const responseBody: string | object | undefined = response.body
          if (Predicates.isObject(responseBody)) {
            res.contentType('application/json').json(responseBody)
          } else if (Predicates.isString(response.body)) {
            res.contentType('text/plain').send(responseBody)
          } else {
            res.send()
          }
          next()
        },
        next
      )
  }

  private static readBody (req: Request): Promise<Buffer> {
    return new Promise<Buffer>(
      (resolve) => {
        const buffers: Array<Buffer> = []
        req.on('data', (chunk) => buffers.push(chunk))
        req.on('end', () => resolve(Buffer.concat(buffers)))
      }
    )
  }
}

export default ExpressServletAdapter
