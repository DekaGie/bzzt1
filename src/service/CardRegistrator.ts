import { Optional } from 'typescript-optional'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import CardRepository from '../db/repo/CardRepository'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import CardDbo from '../db/dbo/CardDbo'
import Instant from './domain/Instant'
import CustomerConversator from './CustomerConversator'
import StaticImageUrls from './StaticImageUrls'

class CardRegistrator {
  private readonly cardRegistrationRepository: CardRegistrationRepository;

  private readonly cardRepository: CardRepository;

  constructor (
    cardRepository: CardRepository,
    cardRegistrationRepository: CardRegistrationRepository
  ) {
    this.cardRepository = cardRepository
    this.cardRegistrationRepository = cardRegistrationRepository
  }

  validateAndRegister (
    conversator: CustomerConversator,
    cardNumber: number
  ): void {
    this.cardRepository.findFull(cardNumber)
      .then(Optional.ofNullable)
      .then(
        (optionalCard) => {
          if (!optionalCard.isPresent()) {
            conversator.callback().sendText(
              `Hmmm, ${cardNumber}?\nTo nie wygląda jak prawidłowy numer karty Beauty Zazero :(`
            )
            return
          }
          const card: CardDbo = optionalCard.get()
          if (Optional.ofNullable(card.registration).isPresent()) {
            conversator.callback().sendText(
              'Niestety, ta karta została już aktywowana przez kogoś innego.'
            )
            return
          }
          const validUntil: Instant = new Instant(card.agreement.validUntilEs)
          if (Instant.now().isAtOrAfter(validUntil)) {
            conversator.callback().sendText('Niestety, ta karta jest nieważna.')
            return
          }
          this.register(conversator, card)
        }
      )
      .catch(
        (error) => {
          console.error(`while validating card ${cardNumber}`)
          console.error(error)
        }
      )
  }

  private register (conversator: CustomerConversator, card: CardDbo): void {
    const registration: CardRegistrationDbo = new CardRegistrationDbo()
    registration.card = card
    registration.customerId = conversator.id().toRepresentation()
    this.cardRegistrationRepository.save(registration)
      .then(
        () => {
          CardRegistrator.promptActive(conversator, card)
        }
      )
      .catch(
        (error) => {
          console.error(`while registering ${card.cardNumber} to ${conversator.id()}`)
          console.error(error)
          conversator.callback().sendText(
            'Przepraszam, ale wystąpił błąd podczas rejestracji.\n'
              + 'Skontaktuje się z Tobą nasz przedstawiciel.'
          )
        }
      )
  }

  private static promptActive (conversator: CustomerConversator, card: CardDbo): void {
    conversator.callback().sendOptions(
      {
        topImage: Optional.of(StaticImageUrls.WELCOME),
        title: `Karta od ${card.agreement.employerName} aktywowana!`,
        subtitle: Optional.of(
          'Pewnie chcesz wiedzieć co dalej?'
        ),
        buttons: [
          {
            command: {
              type: 'ACTIVE_CUSTOMER_ACTION',
              action: 'SHOW_TUTORIAL'
            },
            text: 'Jak użyć karty?'
          },
          {
            command: {
              type: 'ACTIVE_CUSTOMER_ACTION',
              action: 'SHOW_SUBSCRIPTIONS'
            },
            text: 'Do jakich usług?'
          },
          {
            command: {
              type: 'ACTIVE_CUSTOMER_ACTION',
              action: 'SHOW_PARTNERS'
            },
            text: 'W których salonach?'
          }
        ]
      }
    )
  }
}

export default CardRegistrator
