import FacebookerId from './domain/FacebookerId'
import PersonalChatBot from './PersonalChatBot'
import FbClient from '../fb/FbClient'
import PersonalOutbox from './PersonalOutbox'

class ChatBot {
  private readonly fbClient: FbClient

  constructor (fbClient: FbClient) {
    this.fbClient = fbClient
  }

  with (facebookerId: FacebookerId): PersonalChatBot {
    return new PersonalChatBot(
      new PersonalOutbox(
        this.fbClient.messenger(facebookerId.toRepresentation())
      )
    )
  }
}

export default ChatBot
