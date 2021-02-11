import { Optional } from 'typescript-optional'
import ActorAssistant from './ActorAssistant'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import StaticImageUrls from './StaticImageUrls'
import Inquiry from './spi/Inquiry'
import Reaction from './spi/Reaction'
import Reactions from './spi/Reactions'
import TextExtractions from './TextExtractions'
import FreeTextInquiry from './spi/FreeTextInquiry'
import CustomerIntent from './CustomerIntent'
import Choices from './spi/Choices'
import Results from './Results'
import GpTexts from './text/GpTexts'
import CustomerTexts from './text/CustomerTexts'

class CustomerAssistant implements ActorAssistant<CardRegistrationDbo> {
  handle (registration: CardRegistrationDbo, inquiry: Inquiry): Promise<Array<Reaction>> {
    switch (inquiry.type) {
      case 'FREE_TEXT': {
        const freeTextInquiry: FreeTextInquiry = inquiry as FreeTextInquiry
        const intent: Optional<CustomerIntent> = TextExtractions.customerIntent(freeTextInquiry.freeText)
        if (!intent.isPresent()) {
          return this.handleUnknown(registration)
        }
        return this.handleIntent(intent.get())
      }
      case 'IMAGE': {
        return Results.many(
          Reactions.plainText(
            CustomerTexts.alreadyActivated(
              registration.card.cardNumber, registration.card.agreement.employerName
            )
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

  private handleUnknown (registration: CardRegistrationDbo): Promise<Array<Reaction>> {
    return Results.many(
      Reactions.choice(
        {
          topImage: Optional.empty(),
          title: CustomerTexts.welcome(
            Optional.ofNullable(registration.identification)
              .map((identification) => identification.firstName)
          ),
          subtitle: Optional.of(CustomerTexts.intentPrompt()),
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
              topImage: Optional.of(StaticImageUrls.POWER_BANNER),
              title: 'Power Brows',
              subtitle: Optional.of('Brwi: wszystko. Rzęsy: Laminacja, Henna.'),
              choices: [
                Choices.link(CustomerTexts.onlineBooking(), 'https://www.moment.pl/power-brows'),
                Choices.phone(CustomerTexts.phoneBooking(), '+48736842624')
              ]
            }
          ),
          Reactions.choice(
            {
              topImage: Optional.of(StaticImageUrls.GINGER_BANNER),
              title: 'Ginger Zone',
              subtitle: Optional.of('Rzęsy: Przedłużanie 1:1, Laminacja, Henna. Brwi: wszystko.'),
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
              topImage: Optional.of(StaticImageUrls.BROWS),
              title: 'Brwi',
              subtitle: Optional.of(
                'Regulacja, Laminacja, Henna, Depilacja twarzy woskiem.'
              ),
              choices: []
            }
          ),
          Reactions.choice(
            {
              topImage: Optional.of(StaticImageUrls.LASHES),
              title: 'Rzęsy',
              subtitle: Optional.of(
                'Laminacja, Henna, Przedłużanie 1:1.'
              ),
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