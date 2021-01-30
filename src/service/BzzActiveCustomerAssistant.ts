import InteractionCallback from './spi/InteractionCallback'
import ImageUrl from './domain/ImageUrl'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'

class BzzActiveCustomerAssistant implements BzzCustomerAssistant {
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
}

export default BzzActiveCustomerAssistant
