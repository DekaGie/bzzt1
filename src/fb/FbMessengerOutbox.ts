import FbGenericTemplate from './FbGenericTemplate'

interface FbMessengerOutbox {

  sendText (psid: string, text: string): Promise<void>

  sendGenericTemplate (psid: string, generics: Array<FbGenericTemplate>): Promise<void>;
}

export default FbMessengerOutbox
