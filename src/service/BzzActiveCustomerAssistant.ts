import { isDeepStrictEqual } from 'util'
import { Optional } from 'typescript-optional'
import InteractionCallback from './spi/InteractionCallback'
import ImageUrl from './domain/ImageUrl'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import StaticImageUrls from './StaticImageUrls'

class BzzActiveCustomerAssistant implements BzzCustomerAssistant {
  static SHOW_PARTNERS: any = {
    type: 'ACTIVE_CUSTOMER_ACTION',
    action: 'SHOW_PARTNERS'
  }

  private readonly registration: CardRegistrationDbo;

  private readonly callback: InteractionCallback;

  constructor (registration: CardRegistrationDbo, callback: InteractionCallback) {
    this.registration = registration
    this.callback = callback
  }

  onText (text: string): void {
    this.callback.sendOptions(
      {
        topImage: Optional.of(StaticImageUrls.HORIZONTAL_LOGO),
        title: 'Witaj ponownie!',
        subtitle: Optional.of('Życzę miłego testowania karty.'),
        buttons: [
          {
            text: 'Salony partnerskie',
            command: BzzActiveCustomerAssistant.SHOW_PARTNERS
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
    this.callback.sendText(`Dzięki, ale Twoja karta ${this.registration.card.cardNumber} (od ${this.registration.card.agreement.employerName}) jest już aktywna, więc nie potrzebuję od Ciebie więcej zdjęć :)`)
  }

  onCommand (command: any): void {
    if (!isDeepStrictEqual(command, BzzActiveCustomerAssistant.SHOW_PARTNERS)) {
      console.error(`received unexpected command: ${JSON.stringify(command)}`)
      this.callback.sendText('Przepraszam, nie zrozumiałem Cię.')
      return
    }
    this.showPartners()
  }

  private showPartners (): void {
    this.callback.sendOptions(
      {
        topImage: Optional.of(StaticImageUrls.POWER_BANNER),
        title: 'Power Brows',
        subtitle: Optional.of(
          '- Wszystko dla brwi\n'
              + '- Rzęsy: laminacja i henna\n'
              + '- Depilacja twarzy woskiem'
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
      }
    )
    this.callback.sendOptions(
      {
        topImage: Optional.of(StaticImageUrls.GINGER_BANNER),
        title: 'Ginger Zone',
        subtitle: Optional.of(
          '- Rzęsy: przedłużanie 1:1, laminacja i henna\n'
              + '- Wszystko dla brwi'
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
}

export default BzzActiveCustomerAssistant
