import { Optional } from 'typescript-optional'
import HttpServlet from './http/HttpServlet'
import HttpResponse from './http/HttpResponse'
import HttpRequest from './http/HttpRequest'
import HttpError from './http/HttpError'
import JsonObject from './json/JsonObject'
import FbClient from './fb/FbClient'
import CardChecker from './service/CardChecker'
import BarcodeParser from './service/BarcodeParser'

class MessagingServlet implements HttpServlet {
  private readonly barcodeParser: BarcodeParser;

  private readonly cardChecker: CardChecker;

  private readonly fbClient: FbClient;

  constructor (
    barcodeParser: BarcodeParser,
    cardChecker: CardChecker,
    fbClient: FbClient
  ) {
    this.barcodeParser = barcodeParser
    this.cardChecker = cardChecker
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
    message.optional('text')
      .map((element) => element.asString())
      .flatMap((string) => MessagingServlet.extractNumber(string))
      .map((detected) => Promise.resolve(Optional.of(detected)))
      .orElseGet(
        () => message.optional('attachments')
          .map((attachments) => attachments.asArray())
          .flatMap(
            (attachments) => Optional.ofNullable(
              attachments.map((attachment) => attachment.asObject()).find(
                (attachment) => attachment.mandatory('type').asString() === 'image'
              )
            )
          )
          .map((attachment) => attachment.mandatory('payload').asObject().mandatory('url').asString())
          .map((imageUrl) => this.barcodeParser.parse(imageUrl))
          .orElse(Promise.resolve(Optional.empty()))
      )
      .then(
        (detected) => {
          console.log(`handling ${detected.map((cardNumber) => cardNumber.toString()).orElse('<not found>')}`)
          return detected.map((cardNumber) => this.cardChecker.check(cardNumber))
            .orElse('Dzień dobry!\nZeskanuj kartę Beauty ZAZERO lub podaj jej numer.')
        }
      )
      .catch(
        (error) => {
          console.error('error while detecting card number:')
          console.error(error)
          return 'Przepraszam, ale coś poszło nie tak. Spróbuj ponownie później.'
        }
      )
      .then(
        (response) => this.fbClient.messenger(senderId)
          .send(response)
          .catch(
            (error) => {
              console.error(`error while responding to ${senderId}:`)
              console.error(error)
            }
          )
      )
  }

  private handlePostback (senderId: string, postback: JsonObject): void {

  }

  private static extractNumber (string: string): Optional<number> {
    return Optional.of(
      Number.parseInt(
        Array.from(string)
          .filter((char) => char >= '0' && char <= '9')
          .reduce((left, right) => left + right),
        10
      )
    ).filter((value) => !Number.isNaN(value))
  }
}

export default MessagingServlet
