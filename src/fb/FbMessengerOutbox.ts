interface FbMessengerOutbox {

  sendText (psid: string, text: string): void

  sendImage (psid: string, url: string): void;
}

export default FbMessengerOutbox
