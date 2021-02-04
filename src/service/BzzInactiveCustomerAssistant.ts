import { Optional } from 'typescript-optional'
import ImageUrl from './domain/ImageUrl'
import BarcodeParser from './BarcodeParser'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import StaticImageUrls from './StaticImageUrls'
import BangAssistantDelegate from './BangAssistantDelegate'
import CardRegistrator from './CardRegistrator'
import CustomerConversator from './CustomerConversator'
import StateCategoryId from './domain/StateCategoryId'
import StateSlot from './StateSlot'

class BzzInactiveCustomerAssistant implements BzzCustomerAssistant {
  private static readonly ASKED_FOR_ACTIVATE: StateCategoryId =
      new StateCategoryId(BzzInactiveCustomerAssistant.name, 'ASKED_FOR_ACTIVATE');

  private readonly conversator: CustomerConversator;

  private readonly bangDelegate: BangAssistantDelegate;

  private readonly cardRegistrator: CardRegistrator;

  private readonly barcodeParser: BarcodeParser;

  constructor (
    conversator: CustomerConversator,
    bangDelegate: BangAssistantDelegate,
    barcodeParser: BarcodeParser,
    cardRegistrator: CardRegistrator
  ) {
    this.conversator = conversator
    this.bangDelegate = bangDelegate
    this.barcodeParser = barcodeParser
    this.cardRegistrator = cardRegistrator
  }

  onText (text: string): void {
    if (text.startsWith('!')) {
      this.bangDelegate.onBang(text.substring(1))
      return
    }
    const cardNumber: Optional<number> = BzzInactiveCustomerAssistant.extractNumber(text)
    if (cardNumber.isPresent()) {
      this.onCardNumber(cardNumber.get())
      return
    }
    this.conversator.callback().sendOptions(
      {
        topImage: Optional.of(StaticImageUrls.HORIZONTAL_LOGO),
        title: 'Hej, nieznajoma!',
        subtitle: Optional.of('Czym jesteś zainteresowana?'),
        buttons: [
          {
            text: 'Aktywuj kartę!',
            command: {
              type: 'INACTIVE_CUSTOMER_ACTION',
              action: 'PROMPT_ACTIVATE'
            }
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
    if (command.type !== 'INACTIVE_CUSTOMER_ACTION') {
      return
    }
    if (command.action === 'PROMPT_ACTIVATE') {
      this.conversator.state(BzzInactiveCustomerAssistant.ASKED_FOR_ACTIVATE).set(true)
      this.conversator.callback().sendText(
        'Dobrze :)\nW takim razie zrób zdjęcie swojej karty Beauty Zazero lub podaj mi jej numer.'
      )
      return
    }
    if (command.action === 'ACTIVATE') {
      this.cardRegistrator.validateAndRegister(this.conversator, command.cardNumber)
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
        this.cardRegistrator.validateAndRegister(this.conversator, cardNumber.get())
      }
    )
  }

  onCardNumber (cardNumber: number): void {
    const asked: StateSlot<Boolean> = this.conversator.state(BzzInactiveCustomerAssistant.ASKED_FOR_ACTIVATE)
    asked.defaultTo(false)
    if (asked.get()) {
      this.cardRegistrator.validateAndRegister(this.conversator, cardNumber)
    } else {
      this.conversator.callback().sendOptions(
        {
          topImage: Optional.of(StaticImageUrls.HORIZONTAL_LOGO),
          title: 'Ooo, to karta Beauty Zazero!',
          subtitle: Optional.of('Chcesz ją aktywować?'),
          buttons: [
            {
              text: 'Tak!',
              command: {
                type: 'INACTIVE_CUSTOMER_ACTION',
                action: 'ACTIVATE',
                cardNumber
              }
            }
          ]
        }
      )
    }
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

export default BzzInactiveCustomerAssistant
