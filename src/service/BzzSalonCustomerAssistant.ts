import { Optional } from 'typescript-optional'
import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import ImageUrl from './domain/ImageUrl'
import BarcodeParser from './BarcodeParser'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import CustomerConversator from './CustomerConversator'
import CardRepository from '../db/repo/CardRepository'
import Instant from './domain/Instant'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import IdentificationDbo from '../db/dbo/IdentificationDbo'

class BzzSalonCustomerAssistant implements BzzCustomerAssistant {
  private readonly conversator: CustomerConversator;

  private readonly barcodeParser: BarcodeParser;

  private readonly cardRepository: CardRepository;

  constructor (
    conversator: CustomerConversator,
    barcodeParser: BarcodeParser,
    cardRepository: CardRepository
  ) {
    this.conversator = conversator
    this.barcodeParser = barcodeParser
    this.cardRepository = cardRepository
  }

  onText (text: string): void {
    const cardNumber: Optional<number> = BzzSalonCustomerAssistant.extractNumber(text)
    if (cardNumber.isPresent()) {
      this.onCardNumber(cardNumber.get())
      return
    }
    this.conversator.callback().sendText(
      'Twoje konto jest powiązane z salonem.\n'
        + 'Zrób zdjęcie karty Beauty Zazero lub podaj mi jej numer.'
    )
  }

  onCommand (command: any): void {
    const transport: Mail = nodemailer.createTransport(
      {
        host: 'smtp-relay.sendinblue.com',
        port: 587,
        auth: {
          user: 'beauty.zazero@gmail.com',
          pass: 'kzjPqdQ6hJIH3Urn'
        }
      }
    )
    try {
      transport.sendMail(
        {
          from: 'wtf@mail.com',
          to: 'jakrawcz@gmail.com',
          subject: 'Hola',
          text: 'Także tego!'
        }
      ).then(
        (info) => {
          console.log('success')
          console.log(JSON.stringify(info))
        },
        (error) => {
          console.error('while sending e-mail')
          console.error(error)
        }
      )
    } finally {
      transport.close()
    }
  }

  onImage (url: ImageUrl): void {
    this.barcodeParser.parse(url).then(
      (cardNumber) => {
        if (!cardNumber.isPresent()) {
          this.conversator.callback().sendText(
            'Postaraj się wykonać z bliska zdjęcie kompletnego kodu kreskowego karty.'
          )
          return
        }
        this.onCardNumber(cardNumber.get())
      }
    )
  }

  onCardNumber (cardNumber: number): void {
    this.cardRepository.findFull(cardNumber)
      .then(Optional.ofNullable)
      .then(
        (card) => {
          if (!card.isPresent()) {
            this.conversator.callback().sendText(
              `${cardNumber} nie jest poprawnym numerem karty Beauty Zazero, lub ta karta nie została jeszcze formalnie wydana. Nie akceptuj jej!`
            )
            return
          }
          const validUntil: Instant = new Instant(card.get().agreement.validUntilEs)
          if (Instant.now().isAtOrAfter(validUntil)) {
            this.conversator.callback().sendText(`Karta ${cardNumber} jest nieważna. Nie akceptuj jej!`)
            return
          }
          const registration: Optional<CardRegistrationDbo> = Optional.ofNullable(card.get().registration)
          if (!registration.isPresent()) {
            this.conversator.callback().sendText(`Karta ${cardNumber} nie została jeszcze aktywowana. Zanim ją zaakceptujesz, poproś by klientka zagadała do tego bota i aktywowała kartę.`)
            return
          }
          const identification: Optional<IdentificationDbo> = Optional.ofNullable(registration.get().identification)
          const act: string = 'akceptuj kartę na usługi: regulacja brwi, henna brwi, laminacja brwi, depilacja wąsika, laminacja rzęs, henna rzęs, przedłużanie rzęs 1:1. Zapisz w versum, że użyta była karta Beauty ZAZERO.'
          if (!identification.isPresent()) {
            this.conversator.callback().sendText(`Śmiało ${act}`)
            return
          }
          const fullName: string = `${identification.get().firstName} ${identification.get().lastName}`
          const pictureUrl: Optional<ImageUrl> = Optional.ofNullable(identification.get().pictureUrl)
            .map((url) => new ImageUrl(url))
          if (!pictureUrl.isPresent()) {
            this.conversator.callback().sendOptions(
              {
                topImage: Optional.empty(),
                title: fullName,
                subtitle: Optional.of('Nie mamy zdjęcia. Możemy je zrobić?'),
                buttons: [
                  {
                    text: 'Klientka pozwala :)',
                    command: {
                      type: 'SALON_ACTION',
                      action: 'PROMPT_PICTURE',
                      cardNumber
                    }
                  },
                  {
                    text: 'Nie :(',
                    command: {
                      type: 'SALON_ACTION',
                      action: 'PROMPT_DOCUMENT',
                      cardNumber
                    }
                  },
                ]
              }
            )
            return
          }
          this.conversator.callback().sendImage(pictureUrl.get(), fullName)
          this.conversator.callback().sendText(`Jeśli to ta osoba, ${act}\nJeśli nie zgadza się zdjęcie, poproś o dowód osobisty (aby sprawdzić imię i nazwisko).\nJeśli masz podejrzenia, że to nie ta osoba, dzwoń do operatora karty.`)
        }
      )
      .catch(
        (error) => {
          console.error(`while checking card ${cardNumber}`)
          console.error(error)
          this.conversator.callback().sendText(
            'Wystąpił błąd. Zadzwoń do operatora karty, aby zweryfikować kartę.'
          )
        }
      )
  }

  private static extractNumber (string: string): Optional<number> {
    return Optional.of(
      Array.from(string)
        .filter((char) => char >= '0' && char <= '9')
        .reduce((left, right) => left + right, '')
    )
      .filter((string) => string.length > 6)
      .map((string) => Number.parseInt(string, 10))
      .filter((integer) => !Number.isNaN(integer))
  }
}

export default BzzSalonCustomerAssistant
