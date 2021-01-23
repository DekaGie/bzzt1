import FbMessengerBot from '../fb/FbMessengerBot'
import FbMessengerOutbox from '../fb/FbMessengerOutbox'

class BzzBot implements FbMessengerBot {
  onText (psid: string, text: string, outbox: FbMessengerOutbox): void {
    outbox.sendText(psid, text)
  }

  onImage (psid: string, url: string, outbox: FbMessengerOutbox): void {
    outbox.sendImage(psid, url)
  }
}

export default BzzBot
