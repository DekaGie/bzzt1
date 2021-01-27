import ImageUrl from '../domain/ImageUrl'

interface InteractionCallback {

  sendText (text: string): void

  sendImage (url: ImageUrl, caption: string): void;
}

export default InteractionCallback
