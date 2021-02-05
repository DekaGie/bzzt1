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

  sendGenericTemplate (psid: string, generics: Array<FbGenericTemplate>): void {
    if (generics.length === 0) {
      return
    }
    const squareRatio: Set<boolean> = new Set(
      generics.map(
        (generic) => Optional.ofNullable(generic.topImage)
          .map((top) => top.squareRatio === true).orElse(false)
      )
    )
    if (squareRatio.size > 1) {
      throw new Error('cannot send generic templates of different ratios')
    }
    this.send(
      psid,
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: squareRatio.has(true) ? 'square' : 'horizontal',
            elements: generics.map((generic) => FbClientOutbox.toElement(generic))
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

  private static toElement (generic: FbGenericTemplate): object {
    return {
      title: generic.title,
      subtitle: generic.subtitle,
      image_url: Optional.ofNullable(generic.topImage)
        .map((top) => top.url)
        .orElse(null),
      buttons: generic.buttons.length === 0 ? null : generic.buttons.map(
        (button) => {
          if ('postback' in button) {
            return {
              type: 'postback',
              title: button.text,
              payload: button.postback
            }
          }
          if ('url' in button) {
            return {
              type: 'web_url',
              title: button.text,
              url: button.url
            }
          }
          return {
            type: 'phone_number',
            title: button.text,
            payload: button.phoneNumber
          }
        }
      )
    }
  }
}

export default FbClientOutbox
