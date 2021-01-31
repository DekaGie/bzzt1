import InteractionCallback from './spi/InteractionCallback'
import ImageUrl from './domain/ImageUrl'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'

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
    this.callback.sendText(`Ooo, posiadacz karty ${this.registration.card.cardNumber} mówi: ${text}`)
  }

  onImage (url: ImageUrl): void {
    this.callback.sendImage(url, `Oto co wysłał mi posiadacz karty ${this.registration.card.cardNumber}`)
  }

  onCommand (command: any): void {
    console.error(`received unexpected command: ${JSON.stringify(command)}`)
    this.callback.sendText(`Przepraszam, nie zrozumiałem Cię, ${this.registration.card.cardNumber}`)
  }
}

export default BzzActiveCustomerAssistant
