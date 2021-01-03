import HttpServlet from './http/HttpServlet'
import HttpResponse from './http/HttpResponse'
import HttpRequest from './http/HttpRequest'
import HttpError from './http/HttpError'
import JsonObject from './json/JsonObject'
import FbClient from './fb/FbClient'

class MessagingServlet implements HttpServlet {
  private readonly fbClient: FbClient;

  constructor (fbClient: FbClient) {
    this.fbClient = fbClient
  }

  handle (request: HttpRequest): Promise<HttpResponse> {
    if (request.body === undefined) {
      throw new HttpError(400, 'missing request body')
    }
    const top: JsonObject = request.body.asJson().asObject()
    if (top.mandatory('object').asString() !== 'page') {
      throw new HttpError(400, `request not to a page: ${top}`)
    }
    top.mandatory('entry').asArray().forEach(
      (entry) => this.handleEvent(
        entry.asObject().mandatory('messaging').asArray(1)[0].asObject()
      )
    )
    return Promise.resolve(
      {
        code: 200,
        body: 'EVENT_RECEIVED'
      }
    )
  }

  private handleEvent (event: JsonObject): void {
    const senderId: string = event.mandatory('sender').asObject()
      .mandatory('id').asString()
    event.optional('message').ifPresent(
      (message) => this.handleMessage(senderId, message.asObject())
    )
    event.optional('postback').ifPresent(
      (postback) => this.handlePostback(senderId, postback.asObject())
    )
  }

  private handleMessage (senderId: string, message: JsonObject): void {
    message.optional('text').ifPresent(
      (text) => {
        this.fbClient.messenger(senderId)
          .send(`you sent me "${text.asString()}"`)
          .catch(
            (error) => {
              console.error(`could not respond to ${senderId}`)
              console.error(error)
            }
          )
      }
    )
  }

  private handlePostback (senderId: string, postback: JsonObject): void {

  }
}

export default MessagingServlet
