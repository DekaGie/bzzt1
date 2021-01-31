import FbMessengerOutbox from './FbMessengerOutbox'

interface FbMessengerBot {

  onText (psid: string, text: string, outbox: FbMessengerOutbox): void

  onImage (psid: string, url: string, outbox: FbMessengerOutbox): void

  onPostback(psid: string, payload: string, outbox: FbMessengerOutbox): void;
}

export default FbMessengerBot
