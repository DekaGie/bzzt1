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
import SalonResolver from './SalonResolver'
import PacketResolver from './PacketResolver'
import AvailableSalon from '../domain/AvailableSalon'
import AvailablePacket from '../domain/AvailablePacket'
import Choice from '../spi/Choice'

class CustomerAssistant implements ActorAssistant<CustomerActor> {
  private readonly salonResolver: SalonResolver;

  private readonly packetResolver: PacketResolver;

  constructor (salonResolver: SalonResolver, packetResolver: PacketResolver) {
    this.salonResolver = salonResolver
    this.packetResolver = packetResolver
  }

  handle (actor: CustomerActor, inquiry: Inquiry): Promise<Array<Reaction>> {
    switch (inquiry.type) {
      case 'FREE_TEXT': {
        const freeTextInquiry: FreeTextInquiry = inquiry as FreeTextInquiry
        const intent: Optional<CustomerIntent> = TextExtractions.customerIntent(freeTextInquiry.freeText)
        if (!intent.isPresent()) {
          return this.handleUnknown(actor)
        }
        return this.handleIntent(actor, intent.get())
      }
      case 'IMAGE': {
        return Results.many(
          Reactions.plainText(
            CustomerTexts.alreadyActivated(actor.info())
          )
        )
      }
      case 'SHOW_PARTNERS': {
        return this.handleIntent(actor, CustomerIntent.SHOW_PARTNERS)
      }
      case 'SHOW_SUBSCRIPTIONS': {
        return this.handleIntent(actor, CustomerIntent.SHOW_SUBSCRIPTIONS)
      }
      case 'SHOW_TUTORIAL': {
        return this.handleIntent(actor, CustomerIntent.SHOW_TUTORIAL)
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
          title: CustomerTexts.welcome(actor.info().calloutName()),
          subtitle: CustomerTexts.intentPrompt(),
          choices: [
            Choices.inquiry(CustomerTexts.showPartners(), { type: 'SHOW_PARTNERS' }),
            Choices.inquiry(CustomerTexts.showSubscriptions(), { type: 'SHOW_SUBSCRIPTIONS' }),
            Choices.link(GpTexts.faq(), 'https://beautyzazero.pl/faq')
          ]
        }
      )
    )
  }

  private handleIntent (actor: CustomerActor, intent: CustomerIntent): Promise<Array<Reaction>> {
    switch (intent) {
      case CustomerIntent.SHOW_TUTORIAL: {
        return Results.many<Reaction>(
          Reactions.image(StaticImageUrls.ACCEPTED_SIGN, CustomerTexts.signCaption()),
          Reactions.plainText(CustomerTexts.tutorial())
        )
      }
      case CustomerIntent.SHOW_PARTNERS: {
        return this.salonResolver.findAvailable(actor.info().cardNumber()).then(
          (salons) => Results.many(
            ...salons.map((salon) => CustomerAssistant.toSalonReaction(salon))
          )
        )
      }
      case CustomerIntent.SHOW_SUBSCRIPTIONS: {
        return this.packetResolver.findAvailable(actor.info().cardNumber()).then(
          (packets) => Results.many(
            ...packets.map((packet) => CustomerAssistant.toPacketReaction(packet))
          )
        )
      }
      default: {
        return Results.many()
      }
    }
  }

  private static toSalonReaction (salon: AvailableSalon): Reaction {
    return Reactions.choice(
      {
        topImage: salon.picture(),
        title: salon.displayName(),
        subtitle: `${salon.availablePacketNames().join(', ')}.`,
        choices: salon.bookingLinks().map<Choice>(
          (bookingLink, index) => Choices.link(CustomerTexts.onlineBooking(index), bookingLink)
        ).concat(
          Choices.phone(CustomerTexts.phoneBooking(), salon.contactLink())
        )
      }
    )
  }

  private static toPacketReaction (packet: AvailablePacket): Reaction {
    return Reactions.choice(
      {
        topImage: packet.picture(),
        title: packet.displayName(),
        subtitle: `${packet.availableTreatmentNames().join(', ')}.`,
        choices: []
      }
    )
  }
}

export default CustomerAssistant
