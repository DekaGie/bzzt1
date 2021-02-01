import { Optional } from 'typescript-optional'
import FbClient from './FbClient'
import FbMessengerOutbox from '../FbMessengerOutbox'
import FbGenericTemplate from '../FbGenericTemplate'

class FbClientOutbox implements FbMessengerOutbox {
  private readonly fbClient: FbClient;

  constructor (fbClient: FbClient) {
    this.fbClient = fbClient
  }

  sendText (psid: string, text: string): void {
    this.send(
      psid,
      {
        text
      }
    )
  }

  sendGenericTemplate (psid: string, generic: FbGenericTemplate): void {
    this.send(
      psid,
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: Optional.ofNullable(generic.topImage)
              .map((top) => top.squareRatio === true)
              .orElse(false)
              ? 'square' : 'horizontal',
            elements: [
              {
                title: generic.title,
                subtitle: generic.subtitle,
                image_url: Optional.ofNullable(generic.topImage)
                  .map((top) => top.url)
                  .orElse(null),
                buttons: generic.buttons.map(
                  (button) => ({
                    // eslint-disable-next-line no-nested-ternary
                    type: 'postback' in button ? 'postback' : ('url' in button ? 'web_url' : 'phone_number'),
                    title: button.text,
                    // eslint-disable-next-line no-nested-ternary
                    payload: 'postback' in button ? button.postback : ('url' in button ? button.url : button.phoneNumber),
                  })
                )
              }
            ]
          }
        }
      }
    )
  }

  private send (psid: string, message: object): void {
    this.fbClient.send(psid, message).catch(
      (error) => {
        console.error(`while sending to ${psid}: ${JSON.stringify(message)}`)
        console.error(error)
      }
    )
  }
}

export default FbClientOutbox
