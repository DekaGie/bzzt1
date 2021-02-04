import ImageUrl from '../domain/ImageUrl'
import OptionsInteraction from './OptionsInteraction'

interface InteractionCallback {

  sendText (text: string): void

  sendImage (url: ImageUrl, caption: string): void;

  sendOptions(...interactions: Array<OptionsInteraction>): void;
}

export default InteractionCallback
