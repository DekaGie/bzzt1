import ImageUrl from './domain/ImageUrl'
import PersonalOutbox from './PersonalOutbox'

class PersonalChatBot {
  private readonly outbox: PersonalOutbox

  constructor (outbox: PersonalOutbox) {
    this.outbox = outbox
  }

  onText (text: string): void {
    this.outbox.sendText(text)
  }

  onImage (imageUrl: ImageUrl): void {
    this.outbox.sendImage(imageUrl)
  }
}

export default PersonalChatBot
