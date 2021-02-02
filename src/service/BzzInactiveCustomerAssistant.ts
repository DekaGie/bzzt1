import { Optional } from 'typescript-optional'
import { isDeepStrictEqual } from 'util'
import InteractionCallback from './spi/InteractionCallback'
import ImageUrl from './domain/ImageUrl'
import BarcodeParser from './BarcodeParser'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import StaticImageUrls from './StaticImageUrls'
import CardRepository from '../db/repo/CardRepository'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import CardDbo from '../db/dbo/CardDbo'
import BzzActiveCustomerAssistant from './BzzActiveCustomerAssistant'
import CustomerId from './domain/CustomerId'
import SalonRepository from '../db/repo/SalonRepository'
import SalonRegistrationRepository from '../db/repo/SalonRegistrationRepository'
import SalonRegistrationDbo from '../db/dbo/SalonRegistrationDbo'

class BzzInactiveCustomerAssistant implements BzzCustomerAssistant {
  private static ACTIVATE: any = {
    type: 'INACTIVE_CUSTOMER_ACTION',
    action: 'ACTIVATE'
  }

  private readonly cid: CustomerId;

  private readonly cardRegistrationRepository: CardRegistrationRepository;

  private readonly cardRepository: CardRepository;

  private readonly salonRepository: SalonRepository;

  private readonly salonRegistrationRepository: SalonRegistrationRepository

  private readonly barcodeParser: BarcodeParser;

  private readonly callback: InteractionCallback;

  constructor (
    cid: CustomerId,
    cardRepository: CardRepository,
    cardRegistrationRepository: CardRegistrationRepository,
    salonRepository: SalonRepository,
    salonRegistrationRepository: SalonRegistrationRepository,
    barcodeParser: BarcodeParser,
    callback: InteractionCallback
  ) {
    this.cid = cid
    this.cardRepository = cardRepository
    this.cardRegistrationRepository = cardRegistrationRepository
    this.salonRepository = salonRepository
    this.salonRegistrationRepository = salonRegistrationRepository
    this.barcodeParser = barcodeParser
    this.callback = callback
  }

  onText (text: string): void {
    if (text.startsWith('!')) {
      this.handleBang(text.substring(1))
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
        title: 'Hej, nieznajoma!',
        subtitle: Optional.of('Czym jesteś zainteresowana?'),
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
            return
          }
          const card: CardDbo = optionalCard.get()
          if (Optional.ofNullable(card.registration).isPresent()) {
            this.callback.sendText('Ta karta została już aktywowana przez kogoś innego.')
            return
          }
          // TODO: check validity period
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
    this.callback.sendOptions(
      {
        topImage: Optional.empty(),
        title: 'Świetnie!',
        subtitle: Optional.of(
          `Twoja karta od ${card.agreement.employerName} została aktywowana!\nChcesz wiedzieć gdzie jej użyć?`
        ),
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
    registration.customerId = this.cid.toRepresentation()
    registration.manualAnnotation = 'Pierwsze testowe, ufać bez identyfikacji!'
    return this.cardRegistrationRepository.save(registration)
      .then(() => true)
      .catch(
        (error) => {
          console.error(`while registering ${card.cardNumber} to ${this.cid}`)
          console.error(error)
          return false
        }
      )
  }

  private handleBang (content: string): void {
    const parts: Array<string> = content.split(' ')
      .filter((part) => part.length > 0)
    if (parts.length === 0) {
      return
    }
    const verb: string = parts[0]
    if (verb === 'me') {
      this.callback.sendText(this.cid.toString())
      return
    }
    if (verb === 'salon') {
      if (parts.length !== 3) {
        this.callback.sendText('Podaj nazwę salonu i hasło, np. "!salon powerbrows qwe123".')
        return
      }
      const salonName: string = parts[1]
      this.salonRepository.createQueryBuilder('salon')
        .where('salon.salonName = :salonName')
        .setParameters({ salonName })
        .getOne()
        .then(Optional.ofNullable)
        .then(
          (salon) => {
            if (!salon.isPresent()) {
              this.callback.sendText(`Nie znam salonu "${salonName}".`)
              return
            }
            const salonSecret: string = parts[2]
            if (salon.get().salonSecret !== salonSecret) {
              this.callback.sendText(`Niestety, "${salonSecret}" to nie jest poprawne hasło salonu "${salonName}".`)
              return
            }
            const registration: SalonRegistrationDbo = new SalonRegistrationDbo()
            registration.salon = salon.get()
            registration.customerId = this.cid.toRepresentation()
            this.salonRegistrationRepository.save(registration)
              .then(
                () => {
                  this.callback.sendText('Twoje konto od teraz powiązane jest z salonem i służy do skanowania kart klientek.')
                },
                (error) => {
                  console.error(`while registering ${salon.get().salonName} to ${this.cid}`)
                  console.error(error)
                  this.callback.sendText('Niestety wystąpił błąd. Spróbuj później.')
                }
              )
          }
        )
      return
    }
    if (verb === 'spr') {
      const cardNumber: Optional<number> = BzzInactiveCustomerAssistant.extractNumber(content)
      if (!cardNumber.isPresent()) {
        this.callback.sendText('Podaj numer karty, np. "!spr 141520103".')
        return
      }
      this.cardRepository.findFull(cardNumber.get())
        .then(Optional.ofNullable)
        .then(
          (optionalCard) => {
            if (optionalCard.isPresent()) {
              const reg: Optional<CardRegistrationDbo> = Optional.ofNullable(optionalCard.get().registration)
              if (reg.isPresent()) {
                this.callback.sendText(`Ma za darmo 1:1, laminację i hennę rzęs, wszystko na brwi oraz depilację twarzy woskiem (płaci za nią firma ${optionalCard.get().agreement.employerName}).`)
              } else {
                this.callback.sendText('Karta nie została aktywowana! (Klientka musi zagadać do tego samego bota)')
              }
            } else {
              this.callback.sendText('Błędny numer karty!')
            }
          }
        )
    }
  }
}

export default BzzInactiveCustomerAssistant
