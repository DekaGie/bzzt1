import FbMessengerOutbox from '../fb/FbMessengerOutbox'
import ActorId from './domain/ActorId'
import FbMessengerBot from '../fb/FbMessengerBot'
import FreeTextInquiry from './spi/FreeTextInquiry'
import Inquiry from './spi/Inquiry'
import Reaction from './spi/Reaction'
import PlainTextReaction from './spi/PlainTextReaction'
import RichImageReaction from './spi/RichImageReaction'
import RichChoiceReaction from './spi/RichChoiceReaction'
import Arrays from '../util/Arrays'
import { InquiryChoice, LinkChoice, PhoneChoice } from './spi/Choice'
import ImageUrl from './domain/ImageUrl'
import ImageInquiry from './spi/ImageInquiry'
import Promises from '../util/Promises'
import Reactions from './spi/Reactions'
import GpTexts from './text/GpTexts'
import ActorAssistant from './api/ActorAssistant'
import Results from './util/Results'
import Logger from '../log/Logger'
import Loggers from '../log/Loggers'

class BzzBot implements FbMessengerBot {
  private static readonly LOG: Logger = Loggers.get(BzzBot.name)

  private readonly actorAssistant: ActorAssistant<ActorId>

  constructor (actorAssistant: ActorAssistant<ActorId>) {
    this.actorAssistant = actorAssistant
  }

  onText (psid: string, text: string, outbox: FbMessengerOutbox): void {
    this.onInquiry(psid, { type: 'FREE_TEXT', freeText: text } as FreeTextInquiry, outbox)
  }

  onImage (psid: string, url: string, outbox: FbMessengerOutbox): void {
    this.onInquiry(psid, { type: 'IMAGE', imageUrl: new ImageUrl(url) } as ImageInquiry, outbox)
  }

  onPostback (psid: string, payload: string, outbox: FbMessengerOutbox): void {
    this.onInquiry(psid, JSON.parse(payload) as Inquiry, outbox)
  }

  private onInquiry (psid: string, inquiry: Inquiry, outbox: FbMessengerOutbox): void {
    this.actorAssistant.handle(new ActorId(psid), inquiry)
      .catch(
        (error) => {
          BzzBot.LOG.error(`while handling ${psid} inquiring ${JSON.stringify(inquiry)}`, error)
          return Results.many(Reactions.plainText(GpTexts.unexpectedError()))
        }
      )
      .then(
        (reactions) => {
          if (reactions.length === 0) {
            BzzBot.LOG.warn(`no reaction to ${psid} inquiring ${JSON.stringify(inquiry)}`)
          } else {
            BzzBot.LOG.info(`reactions to ${psid} inquiring ${JSON.stringify(inquiry)}: ${JSON.stringify(reactions)}`)
          }
          const groups: Array<Array<Reaction>> = Arrays.sequenceGroupBy(
            reactions, (reaction) => reaction.type
          )
          return Promises.sequential(
            groups, (group) => this.send(outbox, psid, group)
          )
        }
      )
  }

  private send (outbox: FbMessengerOutbox, psid: string, reactions: Array<Reaction>): Promise<void> {
    const type: string = Arrays.getUniformElement(reactions.map((reaction) => reaction.type))
    switch (type) {
      case 'PLAIN_TEXT': {
        const plainTexts: Array<PlainTextReaction> = reactions as Array<PlainTextReaction>
        return Promises.sequential(
          plainTexts, (plainText) => outbox.sendText(psid, plainText.plainText)
        )
      }
      case 'RICH_IMAGE': {
        const richImages: Array<RichImageReaction> = reactions as Array<RichImageReaction>
        return outbox.sendGenericTemplate(
          psid,
          richImages.map(
            (richImage) => (
              {
                topImage: { url: richImage.imageUrl.asString(), squareRatio: true },
                title: richImage.caption,
                buttons: []
              }
            )
          )
        )
      }
      case 'RICH_CHOICE': {
        const richChoices: Array<RichChoiceReaction> = reactions as Array<RichChoiceReaction>
        return outbox.sendGenericTemplate(
          psid,
          richChoices.map(
            (richChoice) => (
              {
                topImage: richChoice.topImage.map(
                  (imageUrl) => (
                    {
                      url: imageUrl.asString(),
                      squareRatio: false
                    }
                  )
                ).orNull(),
                title: richChoice.title,
                subtitle: richChoice.subtitle.orNull(),
                buttons: richChoice.choices.map(
                  (choice) => {
                    switch (choice.type) {
                      case 'LINK': {
                        return {
                          text: choice.label,
                          url: (choice as LinkChoice).url
                        }
                      }
                      case 'PHONE': {
                        return {
                          text: choice.label,
                          phoneNumber: (choice as PhoneChoice).phone
                        }
                      }
                      case 'INQUIRY': {
                        return {
                          text: choice.label,
                          postback: JSON.stringify((choice as InquiryChoice).inquiry)
                        }
                      }
                      default: {
                        throw new Error(`unexpected choice type: ${choice.type}`)
                      }
                    }
                  }
                )
              }
            )
          )
        )
      }
      default: {
        throw new Error(`unexpected reaction type: ${type}`)
      }
    }
  }
}

export default BzzBot
