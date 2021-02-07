import { Optional } from 'typescript-optional'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import CardRepository from '../db/repo/CardRepository'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import CardDbo from '../db/dbo/CardDbo'
import Instant from './domain/Instant'
import StaticImageUrls from './StaticImageUrls'
import Reaction from './spi/Reaction'
import CustomerId from './domain/CustomerId'
import Reactions from './spi/Reactions'
import StaticTexts from './StaticTexts'
import Results from './Results'
import Choices from './spi/Choices'

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

  validateAndRegister (customerId: CustomerId, cardNumber: number): Promise<Array<Reaction>> {
    return this.cardRepository.findFull(cardNumber)
      .then(Optional.ofNullable)
      .then(
        (optionalCard) => {
          if (!optionalCard.isPresent()) {
            return Results.many(Reactions.plainText(StaticTexts.invalidCardNumber(cardNumber)))
          }
          const card: CardDbo = optionalCard.get()
          if (Optional.ofNullable(card.registration).isPresent()) {
            return Results.many(Reactions.plainText(StaticTexts.cardActivatedByAnother(cardNumber)))
          }
          const validUntil: Instant = new Instant(card.agreement.validUntilEs)
          if (Instant.now().isAtOrAfter(validUntil)) {
            return Results.many(Reactions.plainText(StaticTexts.outdatedCard(cardNumber)))
          }
          return this.register(customerId, card)
        }
      )
  }

  private register (customerId: CustomerId, card: CardDbo): Promise<Array<Reaction>> {
    const registration: CardRegistrationDbo = new CardRegistrationDbo()
    registration.card = card
    registration.customerId = customerId.toRepresentation()
    return this.cardRegistrationRepository.save(registration)
      .then(() => CardRegistrator.congratulate(card))
  }

  private static congratulate (card: CardDbo): Promise<Array<Reaction>> {
    return Results.many(
      Reactions.choice(
        {
          topImage: Optional.of(StaticImageUrls.WELCOME),
          title: `Karta od ${card.agreement.employerName} aktywowana!`,
          subtitle: Optional.of(
            'Pewnie chcesz wiedzieć co dalej?'
          ),
          choices: [
            Choices.inquiry(StaticTexts.showTutorial(), { type: 'SHOW_TUTORIAL' }),
            Choices.inquiry(StaticTexts.showPartners(), { type: 'SHOW_PARTNERS' }),
            Choices.inquiry(StaticTexts.showSubscriptions(), { type: 'SHOW_SUBSCRIPTIONS' }),
          ]
        }
      )
    )
  }
}

export default CardRegistrator
