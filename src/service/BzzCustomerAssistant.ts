import { Optional } from 'typescript-optional'
import CustomerId from './domain/CustomerId'
import InteractionCallback from './spi/InteractionCallback'
import ImageUrl from './domain/ImageUrl'
import BarcodeParser from './BarcodeParser'
import CardChecker from './CardChecker'

class BzzCustomerAssistant {
  private readonly barcodeParser: BarcodeParser;

  private readonly cid: CustomerId;

  private readonly callback: InteractionCallback;

  constructor (barcodeParser: BarcodeParser, cid: CustomerId, callback: InteractionCallback) {
    this.barcodeParser = barcodeParser
    this.cid = cid
    this.callback = callback
  }

  onText (text: string) {
    BzzCustomerAssistant.extractNumber(text)
      .ifPresentOrElse(
        (cardNumber) => this.onCardNumber(cardNumber),
        () => this.callback.sendText('Zeskanuj kartę Beauty Zazero lub podaj jej numer.')
      )
  }

  onImage (url: ImageUrl) {
    this.barcodeParser.parse(url)
      .then(
        (fromImage) => {
          fromImage.ifPresentOrElse(
            (cardNumber) => this.onCardNumber(cardNumber),
            () => this.callback.sendText('Postaraj się wykonać z bliska zdjęcie kompletnego kodu kreskowego karty.')
          )
        }
      )
  }

  private onCardNumber (cardNumber: number) {
    this.callback.sendText(new CardChecker().check(cardNumber))
  }

  private static extractNumber (string: string): Optional<number> {
    return Optional.of(
      Number.parseInt(
        Array.from(string)
          .filter((char) => char >= '0' && char <= '9')
          .reduce((left, right) => left + right, ''),
        10
      )
    ).filter((value) => !Number.isNaN(value))
  }
}

export default BzzCustomerAssistant
