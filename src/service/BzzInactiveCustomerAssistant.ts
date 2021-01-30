import { Optional } from 'typescript-optional'
import CustomerId from './domain/CustomerId'
import InteractionCallback from './spi/InteractionCallback'
import ImageUrl from './domain/ImageUrl'
import BarcodeParser from './BarcodeParser'
import CardChecker from './CardChecker'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import StaticImageUrls from './StaticImageUrls'

class BzzInactiveCustomerAssistant implements BzzCustomerAssistant {
  private readonly registrationRepository: CardRegistrationRepository;

  private readonly barcodeParser: BarcodeParser;

  private readonly cid: CustomerId;

  private readonly callback: InteractionCallback;

  constructor (
    registrationRepository: CardRegistrationRepository,
    barcodeParser: BarcodeParser,
    cid: CustomerId,
    callback: InteractionCallback
  ) {
    this.registrationRepository = registrationRepository
    this.barcodeParser = barcodeParser
    this.cid = cid
    this.callback = callback
  }

  onText (text: string): void {
    this.callback.sendOptions(
      {
        topImage: Optional.of(StaticImageUrls.HORIZONTAL_LOGO),
        title: 'Hej!',
        subtitle: Optional.of('Czym jesteś zainteresowana?'),
        buttons: [
          {
            text: 'Aktywuj kartę Beauty Zazero',
            command: {
              type: 'INACTIVE_CUSTOMER_ACTION',
              action: 'ACTIVATE'
            }
          },
          {
            text: 'Wprowadź ten benefit w swojej Firmie',
            phoneNumber: '+48662097978'
          }
        ]
      }
    )
    // BzzInactiveCustomerAssistant.extractNumber(text)
    //   .ifPresentOrElse(
    //     (cardNumber) => this.onCardNumber(cardNumber),
    //     () => this.callback.sendText('Zeskanuj kartę Beauty Zazero lub podaj jej numer.')
    //   )
  }

  onImage (url: ImageUrl): void {
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

export default BzzInactiveCustomerAssistant
