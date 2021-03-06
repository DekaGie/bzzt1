import HttpRequest from '../http/HttpRequest'
import FbMessengerPlatform from '../fb/FbMessengerPlatform'
import HttpServlet from '../http/HttpServlet'
import HttpResponse from '../http/HttpResponse'
import HttpError from '../http/HttpError'

class MessagingServlet implements HttpServlet {
  private readonly fbMessengerPlatform: FbMessengerPlatform;

  constructor (fbMessengerPlatform: FbMessengerPlatform) {
    this.fbMessengerPlatform = fbMessengerPlatform
  }

  handle (request: HttpRequest): Promise<HttpResponse> {
    if (request.body === undefined) {
      throw new HttpError(400, 'missing request body')
    }
    this.fbMessengerPlatform.onCall(request.body.asJson())
    return Promise.resolve(
      {
        code: 200,
        body: 'EVENT_RECEIVED'
      }
    )
  }
}

export default MessagingServlet
