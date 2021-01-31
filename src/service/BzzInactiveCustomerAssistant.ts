import { Optional } from 'typescript-optional'
import { isDeepStrictEqual } from 'util'
import InteractionCallback from './spi/InteractionCallback'
import ImageUrl from './domain/ImageUrl'
import BarcodeParser from './BarcodeParser'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import StaticImageUrls from './StaticImageUrls'
import CustomerExternalInfo from './CustomerExternalInfo'
import CardRepository from '../db/repo/CardRepository'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import CardDbo from '../db/dbo/CardDbo'
import BzzActiveCustomerAssistant from './BzzActiveCustomerAssistant'

class BzzInactiveCustomerAssistant implements BzzCustomerAssistant {
  private static ACTIVATE: any = {
    type: 'INACTIVE_CUSTOMER_ACTION',
    action: 'ACTIVATE'
  }

  private readonly registrationRepository: CardRegistrationRepository;

  private readonly cardRepository: CardRepository;

  private readonly barcodeParser: BarcodeParser;

  private readonly customerInfo: CustomerExternalInfo;

  private readonly callback: InteractionCallback;

  constructor (
    registrationRepository: CardRegistrationRepository,
    cardRepository: CardRepository,
    barcodeParser: BarcodeParser,
    customerInfo: CustomerExternalInfo,
    callback: InteractionCallback
  ) {
    this.registrationRepository = registrationRepository
    this.cardRepository = cardRepository
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
    const cardNumber: Optional<number> = BzzInactiveCustomerAssistant.extractNumber(text)
    if (cardNumber.isPresent()) {
      this.validateAndRegister(cardNumber.get())
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
            command: BzzInactiveCustomerAssistant.ACTIVATE
          },
          {
            text: 'Obsługa klienta',
            phoneNumber: '+48662097978'
          }
        ]
      }
    )
  }

  onCommand (command: any): void {
    if (!isDeepStrictEqual(command, BzzInactiveCustomerAssistant.ACTIVATE)) {
      console.error(`received unexpected command: ${JSON.stringify(command)}`)
      this.callback.sendText('Przepraszam, nie zrozumiałem Cię.')
      return
    }
    this.callback.sendText('Dobrze :)\nW takim razie zeskanuj swoją kartę Beauty Zazero lub podaj mi jej numer.')
  }

  onImage (url: ImageUrl): void {
    this.barcodeParser.parse(url)
      .then(
        (fromImage) => {
          fromImage.ifPresentOrElse(
            (cardNumber) => this.validateAndRegister(cardNumber),
            () => this.callback.sendText('Postaraj się wykonać z bliska zdjęcie kompletnego kodu kreskowego karty.')
          )
        }
      )
  }

  private validateAndRegister (cardNumber: number) {
    this.cardRepository.findFull(cardNumber)
      .then(Optional.ofNullable)
      .then(
        (optionalCard) => {
          if (!optionalCard.isPresent()) {
            this.callback.sendText(`Hmmm, ${cardNumber}?\nTo nie wygląda jak prawidłowy numer karty Beauty Zazero :(`)
          }
          const card: CardDbo = optionalCard.get()
          // TODO: check validity
          this.register(card)
            .then(
              (success) => {
                if (success) {
                  this.promptActive(card)
                } else {
                  this.callback.sendText(
                    'Przepraszam, ale wystąpił błąd podczas rejestracji.\n'
                        + 'Skontaktuje się z Tobą nasz przedstawiciel.'
                  )
                }
              }
            )
        }
      )
      .catch(
        (error) => {
          console.error(`while validating card ${cardNumber}`)
          console.error(error)
        }
      )
  }

  private promptActive (card: CardDbo): void {
    this.callback.sendText(
      `Świetnie!\nTwoja karta numer ${card.cardNumber} (od ${card.agreement.employerName}) została aktywowana!`
    )
    this.callback.sendOptions(
      {
        topImage: Optional.empty(),
        title: 'Pewnie zastanawiasz się gdzie możesz jej użyć?',
        subtitle: Optional.empty(),
        buttons: [
          {
            command: BzzActiveCustomerAssistant.SHOW_PARTNERS,
            text: 'Tak!'
          }
        ]
      }
    )
  }

  private static extractNumber (string: string): Optional<number> {
    return Optional.of(
      Array.from(string)
        .filter((char) => char >= '0' && char <= '9')
        .reduce((left, right) => left + right, '')
    )
      .filter((string) => string.length === 9)
      .map((string) => Number.parseInt(string, 10))
      .filter((integer) => !Number.isNaN(integer))
  }

  private register (card: CardDbo): Promise<boolean> {
    const registration: CardRegistrationDbo = new CardRegistrationDbo()
    registration.card = card
    registration.customerId = this.customerInfo.id.toRepresentation()
    registration.manualAnnotation = 'Pierwsze testowe, ufać bez identyfikacji!'
    return this.registrationRepository.save(registration)
      .then(() => true)
      .catch(
        (error) => {
          console.error(`while registering ${card.cardNumber} to ${this.customerInfo.id}`)
          console.error(error)
          return false
        }
      )
  }
}

export default BzzInactiveCustomerAssistant
