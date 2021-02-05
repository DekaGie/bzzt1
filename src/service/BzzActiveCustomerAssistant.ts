import { Optional } from 'typescript-optional'
import ImageUrl from './domain/ImageUrl'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import StaticImageUrls from './StaticImageUrls'
import CustomerConversator from './CustomerConversator'

class BzzActiveCustomerAssistant implements BzzCustomerAssistant {
  private readonly conversator: CustomerConversator;

  private readonly registration: CardRegistrationDbo;

  constructor (conversator: CustomerConversator, registration: CardRegistrationDbo) {
    this.conversator = conversator
    this.registration = registration
  }

  onText (text: string): void {
    this.conversator.callback().sendOptions(
      {
        topImage: Optional.of(StaticImageUrls.HORIZONTAL_LOGO),
        title: 'Witaj ponownie!',
        subtitle: Optional.of('Życzę miłego testowania karty.'),
        buttons: [
          {
            text: 'Salony partnerskie',
            command: {
              type: 'ACTIVE_CUSTOMER_ACTION',
              action: 'SHOW_PARTNERS'
            }
          },
          {
            text: 'Aktywne usługi',
            command: {
              type: 'ACTIVE_CUSTOMER_ACTION',
              action: 'SHOW_SUBSCRIPTIONS'
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

  onImage (url: ImageUrl): void {
    this.conversator.callback().sendText(
      `Dzięki, ale Twoja karta ${this.registration.card.cardNumber} (od ${this.registration.card.agreement.employerName}) jest już aktywna, więc nie potrzebuję od Ciebie więcej zdjęć :)`
    )
  }

  onCommand (command: any): void {
    if (command.type !== 'ACTIVE_CUSTOMER_ACTION') {
      return
    }
    if (command.action === 'SHOW_PARTNERS') {
      this.showPartners()
      return
    }
    if (command.action === 'SHOW_SUBSCRIPTIONS') {
      this.showSubscriptions()
      return
    }
    if (command.action === 'SHOW_TUTORIAL') {
      this.showTutorial()
      return
    }
    console.error(`Got unexpected command: ${JSON.stringify(command)}`)
  }

  private showTutorial (): void {
    this.conversator.callback().sendImage(
      StaticImageUrls.ACCEPTED_SIGN,
      'Szukaj tego szyldu!'
    )
    this.conversator.callback().sendText(
      'Zapytaj mnie o aktywne na Twojej karcie usługi.\n'
        + 'Następnie spytaj o salony, które akceptują kartę.\n'
        + 'Umów się na wizytę w dowolny sposób - nie musisz nawet wspominać o karcie. '
        + 'Po prostu przy płatności wyciągnij ją zamiast karty płatniczej :)'
    )
  }

  private showPartners (): void {
    this.conversator.callback().sendOptions(
      {
        topImage: Optional.of(StaticImageUrls.POWER_BANNER),
        title: 'Power Brows',
        subtitle: Optional.of(
          'Brwi: wszystko. Rzęsy: Laminacja, Henna.'
        ),
        buttons: [
          {
            text: 'Rezerwacja online',
            url: 'https://www.moment.pl/power-brows'
          },
          {
            text: 'Zadzwoń do nas',
            phoneNumber: '+48736842624'
          }
        ]
      },
      {
        topImage: Optional.of(StaticImageUrls.GINGER_BANNER),
        title: 'Ginger Zone',
        subtitle: Optional.of(
          'Rzęsy: Przedłużanie 1:1, Laminacja, Henna. Brwi: wszystko.'
        ),
        buttons: [
          {
            text: 'Rezerwacja online',
            url: 'https://www.moment.pl/martyna-krawczyk-beauty'
          },
          {
            text: 'Zadzwoń do nas',
            phoneNumber: '+48691120992'
          }
        ]
      }
    )
  }

  private showSubscriptions (): void {
    this.conversator.callback().sendOptions(
      {
        topImage: Optional.of(StaticImageUrls.BROWS),
        title: 'Brwi',
        subtitle: Optional.of(
          'Regulacja, Laminacja, Henna, Depilacja twarzy woskiem.'
        ),
        buttons: []
      },
      {
        topImage: Optional.of(StaticImageUrls.LASHES),
        title: 'Rzęsy',
        subtitle: Optional.of(
          'Laminacja, Henna, Przedłużanie 1:1.'
        ),
        buttons: []
      }
    )
  }
}

export default BzzActiveCustomerAssistant
