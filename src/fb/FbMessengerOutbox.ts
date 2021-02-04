import FbGenericTemplate from './FbGenericTemplate'

interface FbMessengerOutbox {

  sendText (psid: string, text: string): void

  sendGenericTemplate (psid: string, generics: Array<FbGenericTemplate>): void;
}

export default FbMessengerOutbox
