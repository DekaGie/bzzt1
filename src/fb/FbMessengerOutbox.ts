interface FbMessengerOutbox {

  sendText (psid: string, text: string): void

  sendImage (psid: string, url: string, caption: string): void;
}

export default FbMessengerOutbox
