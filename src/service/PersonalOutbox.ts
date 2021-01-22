import ImageUrl from './domain/ImageUrl'
import FbMessenger from '../fb/FbMessenger'

class PersonalOutbox {
  private readonly fbMessenger: FbMessenger

  constructor (fbMessenger: FbMessenger) {
    this.fbMessenger = fbMessenger
  }

  sendText (text: string): void {
    this.fbMessenger.send(text).catch(
      (error) => console.error(error)
    )
  }

  sendImage (imageUrl: ImageUrl): void {
    throw new Error('not implemented yet')
  }
}

export default PersonalOutbox
