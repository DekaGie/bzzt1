import { Optional } from 'typescript-optional'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import CardRepository from '../db/repo/CardRepository'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import CardDbo from '../db/dbo/CardDbo'
import Instant from './domain/Instant'
import StaticImageUrls from './StaticImageUrls'
import Reaction from './spi/Reaction'
import ActorId from './domain/ActorId'
import Reactions from './spi/Reactions'
import Results from './Results'
import Choices from './spi/Choices'
import UnregisteredTexts from './text/UnregisteredTexts'
import CustomerTexts from './text/CustomerTexts'

class CardRegistrator {
  private readonly cardRepository: CardRepository;

  private readonly cardRegistrationRepository: CardRegistrationRepository;

  constructor (
    cardRepository: CardRepository,
    cardRegistrationRepository: CardRegistrationRepository
  ) {
    this.cardRepository = cardRepository
    this.cardRegistrationRepository = cardRegistrationRepository
  }

  validateAndRegister (actorId: ActorId, cardNumber: number): Promise<Array<Reaction>> {
    return this.cardRepository.findFull(cardNumber)
      .then(Optional.ofNullable)
      .then(
        (optionalCard) => {
          if (!optionalCard.isPresent()) {
            return Results.many(Reactions.plainText(UnregisteredTexts.invalidCardNumber(cardNumber)))
          }
          const card: CardDbo = optionalCard.get()
          if (Optional.ofNullable(card.registration).isPresent()) {
            return Results.many(Reactions.plainText(UnregisteredTexts.cardActivatedByAnother(cardNumber)))
          }
          const validUntil: Instant = new Instant(card.agreement.validUntilEs)
          if (Instant.now().isAtOrAfter(validUntil)) {
            return Results.many(Reactions.plainText(UnregisteredTexts.outdatedCard(cardNumber)))
          }
          return this.register(actorId, card)
        }
      )
  }

  private register (actorId: ActorId, card: CardDbo): Promise<Array<Reaction>> {
    const registration: CardRegistrationDbo = new CardRegistrationDbo()
    registration.card = card
    registration.actorId = actorId.toRepresentation()
    return this.cardRegistrationRepository.save(registration)
      .then(() => CardRegistrator.congratulate(card))
  }

  private static congratulate (card: CardDbo): Promise<Array<Reaction>> {
    return Results.many(
      Reactions.choice(
        {
          topImage: Optional.of(StaticImageUrls.WELCOME),
          title: UnregisteredTexts.activationSuccess(card.agreement.employerName),
          subtitle: Optional.of(UnregisteredTexts.whatNext()),
          choices: [
            Choices.inquiry(CustomerTexts.showTutorial(), { type: 'SHOW_TUTORIAL' }),
            Choices.inquiry(CustomerTexts.showPartners(), { type: 'SHOW_PARTNERS' }),
            Choices.inquiry(CustomerTexts.showSubscriptions(), { type: 'SHOW_SUBSCRIPTIONS' }),
          ]
        }
      )
    )
  }
}

export default CardRegistrator
