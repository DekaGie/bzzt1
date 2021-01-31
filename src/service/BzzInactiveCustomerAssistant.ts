import { Optional } from 'typescript-optional'
import InteractionCallback from './spi/InteractionCallback'
import ImageUrl from './domain/ImageUrl'
import BarcodeParser from './BarcodeParser'
import CardChecker from './CardChecker'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import StaticImageUrls from './StaticImageUrls'
import CustomerExternalInfo from './CustomerExternalInfo'

class BzzInactiveCustomerAssistant implements BzzCustomerAssistant {
  private readonly registrationRepository: CardRegistrationRepository;

  private readonly barcodeParser: BarcodeParser;

  private readonly customerInfo: CustomerExternalInfo;

  private readonly callback: InteractionCallback;

  constructor (
    registrationRepository: CardRegistrationRepository,
    barcodeParser: BarcodeParser,
    customerInfo: CustomerExternalInfo,
    callback: InteractionCallback
  ) {
    this.registrationRepository = registrationRepository
    this.barcodeParser = barcodeParser
    this.customerInfo = customerInfo
    this.callback = callback
  }

  onText (text: string): void {
    if (text === '!CustomerExternalInfo') {
      const info: string = `${this.customerInfo.firstName} ${this.customerInfo.lastName} (${this.customerInfo.id})`
      this.customerInfo.picture.ifPresentOrElse(
        (picture) => this.callback.sendImage(picture, info),
        () => this.callback.sendText(info)
      )
      return
    }
    this.callback.sendOptions(
      {
        topImage: Optional.of(StaticImageUrls.HORIZONTAL_LOGO),
        title: `Hej, ${this.customerInfo.shorthand()}!`,
        subtitle: Optional.of(`Czym jesteś zainteresowan${this.customerInfo.gender.mSuffix}?`),
        buttons: [
          {
            text: 'Aktywuj kartę!',
            command: {
              type: 'INACTIVE_CUSTOMER_ACTION',
              action: 'ACTIVATE'
            }
          },
          {
            text: 'Obsługa klienta',
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
