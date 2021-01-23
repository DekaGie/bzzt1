import { Optional } from 'typescript-optional'
import JsonElement from '../json/JsonElement'
import JsonObject from '../json/JsonObject'
import HttpError from '../http/HttpError'
import FbMessengerBot from './FbMessengerBot'
import FbClient from './FbClient'
import FbClientOutbox from './FbClientOutbox'
import FbMessengerOutbox from './FbMessengerOutbox'

class FbMessengerPlatform {
  private readonly outbox: FbMessengerOutbox;

  private readonly bot: FbMessengerBot;

  constructor (fbClient: FbClient, bot: FbMessengerBot) {
    this.outbox = new FbClientOutbox(fbClient)
    this.bot = bot
  }

  onCall (call: JsonElement): void {
    const top: JsonObject = call.asObject()
    if (top.mandatory('object').asString() !== 'page') {
      throw new HttpError(400, `request not to a page: ${top}`)
    }
    top.mandatory('entry').asArray().forEach(
      (entry) => {
        const event: JsonObject = entry.asObject().mandatory('messaging')
          .asArray(1)[0].asObject()
        try {
          this.handleEvent(event)
        } catch (error) {
          console.error(`could not handle event: ${event}`)
          console.error(error)
        }
      }
    )
  }

  private handleEvent (event: JsonObject): void {
    const psid: string = event.mandatory('sender').asObject()
      .mandatory('id').asString()
    event.optional('message').ifPresent(
      (message) => this.handleMessage(psid, message.asObject())
    )
    event.optional('postback').ifPresent(
      (postback) => this.handlePostback(psid, postback.asObject())
    )
  }

  private handleMessage (psid: string, message: JsonObject): void {
    message.optional('text')
      .map((element) => element.asString())
      .ifPresentOrElse(
        (text) => this.bot.onText(psid, text, this.outbox),
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
          .ifPresentOrElse(
            (url) => this.bot.onImage(psid, url, this.outbox),
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

  private handlePostback (psid: string, postback: JsonObject): void {

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

export default FbMessengerPlatform
