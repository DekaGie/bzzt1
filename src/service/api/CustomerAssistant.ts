import { Optional } from 'typescript-optional'
import ActorAssistant from './ActorAssistant'
import CustomerIntent from '../domain/CustomerIntent'
import CustomerTexts from '../text/CustomerTexts'
import Choices from '../spi/Choices'
import GpTexts from '../text/GpTexts'
import StaticImageUrls from '../util/StaticImageUrls'
import FreeTextInquiry from '../spi/FreeTextInquiry'
import Reactions from '../spi/Reactions'
import Inquiry from '../spi/Inquiry'
import Reaction from '../spi/Reaction'
import TextExtractions from '../util/TextExtractions'
import Results from '../util/Results'
import CustomerActor from '../domain/CustomerActor'

class CustomerAssistant implements ActorAssistant<CustomerActor> {
  handle (actor: CustomerActor, inquiry: Inquiry): Promise<Array<Reaction>> {
    switch (inquiry.type) {
      case 'FREE_TEXT': {
        const freeTextInquiry: FreeTextInquiry = inquiry as FreeTextInquiry
        const intent: Optional<CustomerIntent> = TextExtractions.customerIntent(freeTextInquiry.freeText)
        if (!intent.isPresent()) {
          return this.handleUnknown(actor)
        }
        return this.handleIntent(intent.get())
      }
      case 'IMAGE': {
        return Results.many(
          Reactions.plainText(
            CustomerTexts.alreadyActivated(actor.cardNumber().asNumber(), actor.employerName())
          )
        )
      }
      case 'SHOW_PARTNERS': {
        return this.handleIntent(CustomerIntent.SHOW_PARTNERS)
      }
      case 'SHOW_SUBSCRIPTIONS': {
        return this.handleIntent(CustomerIntent.SHOW_SUBSCRIPTIONS)
      }
      case 'SHOW_TUTORIAL': {
        return this.handleIntent(CustomerIntent.SHOW_TUTORIAL)
      }
      default: {
        return Results.many()
      }
    }
  }

  private handleUnknown (actor: CustomerActor): Promise<Array<Reaction>> {
    return Results.many(
      Reactions.choice(
        {
          title: CustomerTexts.welcome(actor.calloutName()),
          subtitle: CustomerTexts.intentPrompt(),
          choices: [
            Choices.inquiry(CustomerTexts.showPartners(), { type: 'SHOW_PARTNERS' }),
            Choices.inquiry(CustomerTexts.showSubscriptions(), { type: 'SHOW_SUBSCRIPTIONS' }),
            Choices.phone(GpTexts.customerService(), '+48662097978')
          ]
        }
      )
    )
  }

  private handleIntent (intent: CustomerIntent): Promise<Array<Reaction>> {
    switch (intent) {
      case CustomerIntent.SHOW_TUTORIAL: {
        return Results.many<Reaction>(
          Reactions.image(StaticImageUrls.ACCEPTED_SIGN, CustomerTexts.signCaption()),
          Reactions.plainText(CustomerTexts.tutorial())
        )
      }
      case CustomerIntent.SHOW_PARTNERS: {
        // TODO: from DB
        return Results.many(
          Reactions.choice(
            {
              topImage: StaticImageUrls.POWER_BANNER,
              title: 'Power Brows',
              subtitle: 'Brwi: wszystko. Rzęsy: Laminacja, Henna.',
              choices: [
                Choices.link(CustomerTexts.onlineBooking(), 'https://www.moment.pl/power-brows'),
                Choices.phone(CustomerTexts.phoneBooking(), '+48736842624')
              ]
            }
          ),
          Reactions.choice(
            {
              topImage: StaticImageUrls.GINGER_BANNER,
              title: 'Ginger Zone',
              subtitle: 'Rzęsy: Przedłużanie 1:1, Laminacja, Henna. Brwi: wszystko.',
              choices: [
                Choices.link(CustomerTexts.onlineBooking(), 'https://www.moment.pl/martyna-krawczyk-beauty'),
                Choices.phone(CustomerTexts.phoneBooking(), '+48691120992')
              ]
            }
          )
        )
      }
      case CustomerIntent.SHOW_SUBSCRIPTIONS: {
        // TODO: from DB
        return Results.many(
          Reactions.choice(
            {
              topImage: StaticImageUrls.BROWS,
              title: 'Brwi',
              subtitle: 'Regulacja, Laminacja, Henna, Depilacja twarzy woskiem.',
              choices: []
            }
          ),
          Reactions.choice(
            {
              topImage: StaticImageUrls.LASHES,
              title: 'Rzęsy',
              subtitle: 'Laminacja, Henna, Przedłużanie 1:1.',
              choices: []
            }
          )
        )
      }
      default: {
        return Results.many()
      }
    }
  }
}

export default CustomerAssistant
