import { Optional } from 'typescript-optional'
import FbClient from './FbClient'
import FbMessengerOutbox from '../FbMessengerOutbox'
import FbGenericTemplate from '../FbGenericTemplate'
import Logger from '../../log/Logger'
import Loggers from '../../log/Loggers'

class FbClientOutbox implements FbMessengerOutbox {
  private static readonly LOG: Logger = Loggers.get(FbClientOutbox.name)

  private readonly fbClient: FbClient;

  constructor (fbClient: FbClient) {
    this.fbClient = fbClient
  }

  sendText (psid: string, text: string): Promise<void> {
    return this.send(
      psid,
      {
        text
      }
    )
  }

  sendGenericTemplate (psid: string, generic: FbGenericTemplate): Promise<void> {
    const squareRatio: boolean = Optional.ofNullable(generic.topImage)
      .map((top) => top.squareRatio === true).orElse(false)
    return this.send(
      psid,
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: squareRatio ? 'square' : 'horizontal',
            elements: [FbClientOutbox.toElement(generic)]
          }
        }
      }
    )
  }

  private send (psid: string, message: object): Promise<void> {
    return this.fbClient.send(psid, message).catch(
      (error) => {
        FbClientOutbox.LOG.error(`while sending to ${psid}: ${JSON.stringify(message)}`, error)
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
