import Instant from '../domain/Instant'
import StaticImageUrls from '../util/StaticImageUrls'
import Reactions from '../spi/Reactions'
import ActorId from '../domain/ActorId'
import Reaction from '../spi/Reaction'
import CardRegistrationDbo from '../../db/dbo/CardRegistrationDbo'
import CustomerTexts from '../text/CustomerTexts'
import CardRegistrationRepository
  from '../../db/repo/CardRegistrationRepository'
import Choices from '../spi/Choices'
import UnregisteredTexts from '../text/UnregisteredTexts'
import CardDbo from '../../db/dbo/CardDbo'
import Results from '../util/Results'
import CheckedCard from '../domain/CheckedCard'
import CardChecker from './CardChecker'
import Logger from '../../log/Logger'
import Loggers from '../../log/Loggers'

class CardRegistrator {
  private static readonly LOG: Logger = Loggers.get(CardRegistrator.name)

  private readonly cardChecker: CardChecker;

  private readonly cardRegistrationRepository: CardRegistrationRepository;

  constructor (
    cardChecker: CardChecker,
    cardRegistrationRepository: CardRegistrationRepository
  ) {
    this.cardChecker = cardChecker
    this.cardRegistrationRepository = cardRegistrationRepository
  }

  validateAndRegister (actorId: ActorId, cardNumber: number): Promise<Array<Reaction>> {
    return this.cardChecker.check(cardNumber)
      .then(
        (optionalCard) => {
          if (!optionalCard.isPresent()) {
            return Results.many(Reactions.plainText(UnregisteredTexts.invalidCardNumber(cardNumber)))
          }
          const card: CheckedCard = optionalCard.get()
          if (Instant.now().isAtOrAfter(card.validUntil())) {
            return Results.many(Reactions.plainText(UnregisteredTexts.outdatedCard(card.cardNumber())))
          }
          if (card.holder().isPresent()) {
            return Results.many(Reactions.plainText(UnregisteredTexts.cardActivatedByAnother(card.cardNumber())))
          }
          return this.register(actorId, card)
        }
      )
  }

  private register (actorId: ActorId, card: CheckedCard): Promise<Array<Reaction>> {
    const registration: CardRegistrationDbo = new CardRegistrationDbo()
    registration.card = CardDbo.refer(card.cardNumber().asNumber())
    registration.actorId = actorId.toRepresentation()
    return this.cardRegistrationRepository.save(registration)
      .then(() => CardRegistrator.congratulate(actorId, card))
  }

  private static congratulate (actorId: ActorId, card: CheckedCard): Promise<Array<Reaction>> {
    CardRegistrator.LOG.warn(`card ${card.cardNumber()} just registered to ${actorId}`)
    return Results.many(
      Reactions.choice(
        {
          topImage: StaticImageUrls.WELCOME,
          title: UnregisteredTexts.activationSuccess(card.employerName()),
          subtitle: UnregisteredTexts.whatNext(),
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
