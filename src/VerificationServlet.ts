import HttpServlet from './http/HttpServlet'
import HttpResponse from './http/HttpResponse'
import HttpRequest from './http/HttpRequest'
import HttpError from './http/HttpError'

class VerificationServlet implements HttpServlet {
  private readonly verifyToken: string;

  constructor (verifyToken: string) {
    this.verifyToken = verifyToken
  }

  handle (request: HttpRequest): Promise<HttpResponse> {
    const mode: string = request.query.mandatory('hub.mode')
    if (mode !== 'subscribe') {
      throw new HttpError(400, `non-subscribe mode: ${mode}`)
    }
    const token: string = request.query.mandatory('hub.verify_token')
    if (token !== this.verifyToken) {
      throw new HttpError(400, `invalid token: ${token}`)
    }
    return Promise.resolve(
      {
        code: 200,
        body: request.query.mandatory('hub.challenge')
      }
    )
  }
}

export default VerificationServlet
