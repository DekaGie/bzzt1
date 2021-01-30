import FbGenericTemplate from './FbGenericTemplate'

interface FbMessengerOutbox {

  sendText (psid: string, text: string): void

  sendGenericTemplate (psid: string, generic: FbGenericTemplate): void;
}

export default FbMessengerOutbox
