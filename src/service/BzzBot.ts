// eslint-disable-next-line max-classes-per-file
import BzzCustomerAssistant from './BzzCustomerAssistant'
import InteractionCallback from './spi/InteractionCallback'
import BzzCustomerCare from './BzzCustomerCare'
import FbMessengerOutbox from '../fb/FbMessengerOutbox'
import ImageUrl from './domain/ImageUrl'
import CustomerId from './domain/CustomerId'
import FbMessengerBot from '../fb/FbMessengerBot'
import ErrorCustomerAssistant from './ErrorCustomerAssistant'
import OptionsInteraction from './spi/OptionsInteraction'

class LocalInteractionCallback implements InteractionCallback {
  private readonly outbox: FbMessengerOutbox;

  private readonly psid: string;

  constructor (outbox: FbMessengerOutbox, psid: string) {
    this.outbox = outbox
    this.psid = psid
  }

  sendText (text: string): void {
    this.outbox.sendText(this.psid, text)
  }

  sendImage (url: ImageUrl, caption: string): void {
    this.outbox.sendGenericTemplate(
      this.psid,
      {
        topImage: {
          url: url.asString(),
          squareRatio: true
        },
        title: caption,
        buttons: []
      }
    )
  }

  sendOptions (interaction: OptionsInteraction): void {
    this.outbox.sendGenericTemplate(
      this.psid,
      {
        topImage: interaction.topImage.map(
          (imageUrl) => ({
            url: imageUrl.asString(),
            squareRatio: false
          })
        ).orNull(),
        title: interaction.title,
        subtitle: interaction.subtitle.orNull(),
        buttons: interaction.buttons.map(
          (button) => (
            'command' in button
              ? {
                text: button.text,
                postback: JSON.stringify(button.command)
              }
              : {
                text: button.text,
                phoneNumber: button.phoneNumber
              }
          )
        )
      }
    )
  }
}

class BzzBot implements FbMessengerBot {
  private readonly customerCare: BzzCustomerCare

  constructor (customerCare: BzzCustomerCare) {
    this.customerCare = customerCare
  }

  onText (psid: string, text: string, outbox: FbMessengerOutbox): void {
    this.getAssistant(psid, outbox).then(
      (assistant) => assistant.onText(text)
    )
  }

  onImage (psid: string, url: string, outbox: FbMessengerOutbox): void {
    this.getAssistant(psid, outbox).then(
      (assistant) => assistant.onImage(new ImageUrl(url))
    )
  }

  private getAssistant (
    psid: string, outbox: FbMessengerOutbox
  ): Promise<BzzCustomerAssistant> {
    const callback: InteractionCallback = new LocalInteractionCallback(outbox, psid)
    return this.customerCare.assistantFor(new CustomerId(psid), callback)
      .catch(
        (error) => {
          console.error(`while getting assistant for ${psid}`)
          console.error(error)
          return new ErrorCustomerAssistant(callback)
        }
      )
  }
}

export default BzzBot
