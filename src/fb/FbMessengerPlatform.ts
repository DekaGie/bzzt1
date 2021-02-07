import { Optional } from 'typescript-optional'
import JsonElement from '../json/JsonElement'
import JsonObject from '../json/JsonObject'
import HttpError from '../http/HttpError'
import FbMessengerBot from './FbMessengerBot'
import FbMessengerOutbox from './FbMessengerOutbox'
import FbClient from './impl/FbClient'
import FbClientOutbox from './impl/FbClientOutbox'

class FbMessengerPlatform {
  private readonly outbox: FbMessengerOutbox;

  private readonly bot: FbMessengerBot;

  constructor (fbClient: FbClient, bot: FbMessengerBot) {
    this.outbox = new FbClientOutbox(fbClient)
    this.bot = bot
  }

  onCall (call: JsonElement): void {
    const top: JsonObject = call.asObject()
    if (top.mandatory('object').asString() !== 'page') {
      throw new HttpError(400, `request not to a page: ${top}`)
    }
    top.mandatory('entry').asArray().forEach(
      (entry) => {
        const event: JsonObject = entry.asObject().mandatory('messaging')
          .asArray(1)[0].asObject()
        try {
          this.handleEvent(event)
        } catch (error) {
          console.error(`while handling event: ${event}`)
          console.error(error)
        }
      }
    )
  }

  private handleEvent (event: JsonObject): void {
    const psid: string = event.mandatory('sender').asObject()
      .mandatory('id').asString()
    event.optional('message').ifPresent(
      (message) => this.handleMessage(psid, message.asObject())
    )
    event.optional('postback').ifPresent(
      (postback) => this.handlePostback(psid, postback.asObject())
    )
  }

  private handleMessage (psid: string, message: JsonObject): void {
    message.optional('text')
      .map((element) => element.asString())
      .ifPresentOrElse(
        (text) => this.bot.onText(psid, text, this.outbox),
        () => message.optional('attachments')
          .map((attachments) => attachments.asArray())
          .flatMap(
            (attachments) => Optional.ofNullable(
              attachments.map((attachment) => attachment.asObject()).find(
                (attachment) => attachment.mandatory('type').asString() === 'image'
              )
            )
          )
          .map((attachment) => attachment.mandatory('payload').asObject().mandatory('url').asString())
          .ifPresentOrElse(
            (url) => this.bot.onImage(psid, url, this.outbox),
            () => {
              console.error(`while expecting a certain message: ${message}`)
            }
          )
      )
  }

  private handlePostback (psid: string, postback: JsonObject): void {
    this.bot.onPostback(psid, postback.mandatory('payload').asString(), this.outbox)
  }
}

export default FbMessengerPlatform
