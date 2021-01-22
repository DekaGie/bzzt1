import { Optional } from 'typescript-optional'
import HttpServlet from './http/HttpServlet'
import HttpResponse from './http/HttpResponse'
import HttpRequest from './http/HttpRequest'
import HttpError from './http/HttpError'
import JsonObject from './json/JsonObject'
import FacebookerId from './service/domain/FacebookerId'
import ChatBot from './service/ChatBot'
import PersonalChatBot from './service/PersonalChatBot'
import ImageUrl from './service/domain/ImageUrl'

class MessagingServlet implements HttpServlet {
  private readonly chatBot: ChatBot;

  constructor (chatBot: ChatBot) {
    this.chatBot = chatBot
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
      (entry) => {
        const event: JsonObject = entry.asObject().mandatory('messaging').asArray(1)[0].asObject()
        try {
          this.handleEvent(event)
        } catch (error) {
          console.error(`could not handle event: ${event}`)
          console.error(error)
        }
      }
    )
    return Promise.resolve(
      {
        code: 200,
        body: 'EVENT_RECEIVED'
      }
    )
  }

  private handleEvent (event: JsonObject): void {
    const psid: string = event.mandatory('sender').asObject()
      .mandatory('id').asString()
    const personal: PersonalChatBot = this.chatBot.with(new FacebookerId(psid))
    event.optional('message').map(
      (message) => this.handleMessage(personal, message.asObject())
    )
    event.optional('postback').ifPresent(
      (postback) => this.handlePostback(personal, postback.asObject())
    )
  }

  private handleMessage (personal: PersonalChatBot, message: JsonObject): void {
    message.optional('text')
      .map((element) => element.asString())
      .ifPresentOrElse(
        (text) => personal.onText(text),
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
          .map((url) => new ImageUrl(url))
          .ifPresentOrElse(
            (imageUrl) => personal.onImage(imageUrl),
            () => {
              console.error(`unexpected message: ${message}`)
            }
          )
      )
      // .flatMap((string) => MessagingServlet.extractNumber(string))
      // const cardNumber: number = fromText.get()
      // console.log(`handling from text: ${cardNumber}`)
      // this.handleNumber(psid, cardNumber)
      // return

    // const cardUrl: string = imageUrl.get()
    // console.log(`found attachment: ${cardUrl}`)
    // this.barcodeParser.parse(cardUrl)
    //   .then(
    //     (fromImage) => {
    //       if (fromImage.isPresent()) {
    //         const cardNumber: number = fromImage.get()
    //         console.log(`handling from image: ${cardNumber}`)
    //         this.handleNumber(psid, cardNumber)
    //       } else {
    //         this.respond(psid, 'Postaraj się wykonać z bliska zdjęcie kompletnego kodu kreskowego karty.')
    //       }
    //     }
    //   )
    //   .catch(
    //     (error) => {
    //       console.error('error while detecting card number:')
    //       console.error(error)
    //       this.respond(psid, 'Przepraszam, ale coś poszło nie tak. Spróbuj ponownie później.')
    //     }
    //   )

    // this.respond(psid, 'Dzień dobry!\nZeskanuj kartę Beauty ZAZERO lub podaj jej numer.')
  }

  private handlePostback (personal: PersonalChatBot, postback: JsonObject): void {

  }

  // private handleNumber (senderId: string, cardNumber: number): void {
  //   this.respond(senderId, this.cardChecker.check(cardNumber))
  // }

  // private static extractNumber (string: string): Optional<number> {
  //   return Optional.of(
  //     Number.parseInt(
  //       Array.from(string)
  //         .filter((char) => char >= '0' && char <= '9')
  //         .reduce((left, right) => left + right, ''),
  //       10
  //     )
  //   ).filter((value) => !Number.isNaN(value))
  // }
}

export default MessagingServlet
