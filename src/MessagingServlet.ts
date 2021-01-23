import HttpServlet from './http/HttpServlet'
import HttpResponse from './http/HttpResponse'
import HttpRequest from './http/HttpRequest'
import HttpError from './http/HttpError'
import FbMessengerPlatform from './fb/FbMessengerPlatform'

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
