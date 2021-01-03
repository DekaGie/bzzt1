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
    const verifier: RegExp = new RegExp('^[0-9]{6,16}$')
    message.optional('text').map((element) => element.asString()).ifPresent(
      (text) => {
        let response: string
        if (!verifier.test(text)) {
          response = 'Dzień dobry!\nProszę, podaj mi swój numer karty Beauty ZAZERO.'
        } else if (text === '113192399') {
          response = 'Dziękuję!\nTwoja karta jest ważna do 17.02.2021 i obejmuje usługi:\n'
              + ' - Stylizacja Brwi'
        } else if (text === '113329308') {
          response = 'Dziękuję!\nTwoja karta jest ważna do 31.12.2021 i obejmuje usługi:\n'
              + ' - Paznokcie\n - Stylizacja Rzęs'
        } else if (text === '114945246') {
          response = 'Niestety, Twoja karta straciła ważność 30.11.2020.'
        } else if (text === '114990607') {
          response = 'Niestety, Twoja karta straciła ważność 31.08.2020.'
        } else if (text === '138482385') {
          response = 'Dziękuję!\nTwoja karta jest ważna do 28.06.2021 i obejmuje usługi:\n'
              + ' - Stylizacja Brwi\n - Stylizacja Rzęs'
        } else {
          response = 'Niestety, to nie jest poprawny numer karty. '
              + 'Upewnij się, że przepisałeś wszystkie cyfry znajdujące się pod kodem kreskowym.'
        }

        this.fbClient.messenger(senderId)
          .send(`you sent me "${response}"`)
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
