import FbMessengerBot from './fb/FbMessengerBot'
import FbMessengerOutbox from './fb/FbMessengerOutbox'
import CustomerId from './service/domain/CustomerId'
import BzzCustomerCare from './service/BzzCustomerCare'
import InteractionCallback from './service/spi/InteractionCallback'
import ImageUrl from './service/domain/ImageUrl'
import BzzCustomerAssistant from './service/BzzCustomerAssistant'

class BzzBot implements FbMessengerBot {
  private readonly customerCare: BzzCustomerCare

  constructor (customerCare: BzzCustomerCare) {
    this.customerCare = customerCare
  }

  onText (psid: string, text: string, outbox: FbMessengerOutbox): void {
    this.getAssistant(psid, outbox).onText(text)
  }

  onImage (psid: string, url: string, outbox: FbMessengerOutbox): void {
    this.getAssistant(psid, outbox).onImage(new ImageUrl(url))
  }

  private getAssistant (psid: string, outbox: FbMessengerOutbox): BzzCustomerAssistant {
    return this.customerCare.assistantFor(
      new CustomerId(psid),
      new class implements InteractionCallback {
        sendText (text: string): void {
          outbox.sendText(psid, text)
        }

        sendImage (url: ImageUrl, caption: string): void {
          outbox.sendImage(psid, url.asString(), caption)
        }
      }()
    )
  }
}

export default BzzBot
