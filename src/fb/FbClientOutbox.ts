import FbClient from './FbClient'
import FbMessengerOutbox from './FbMessengerOutbox'

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

  sendImage (psid: string, url: string): void {
    this.send(
      psid,
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'media',
            elements: [
              {
                media_type: 'image',
                url: 'url'
              }
            ]
          }
        }
      }
    )
  }

  send (psid: string, message: object): void {
    this.fbClient.send(psid, message).catch(console.error)
  }
}

export default FbClientOutbox
