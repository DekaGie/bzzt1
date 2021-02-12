import { Optional } from 'typescript-optional'
import CardDbo from '../../db/dbo/CardDbo'
import CardNumber from './CardNumber'
import Instant from './Instant'
import CardHoldingCustomer from './CardHoldingCustomer'

class CheckedCard {
  private readonly dbo: CardDbo;

  constructor (dbo: CardDbo) {
    this.dbo = dbo
  }

  cardNumber (): CardNumber {
    return new CardNumber(this.dbo.cardNumber)
  }

  validUntil (): Instant {
    return new Instant(this.dbo.agreement.validUntilEs)
  }

  holder (): Optional<CardHoldingCustomer> {
    return Optional.ofNullable(this.dbo.registration)
      .map((registration) => new CardHoldingCustomer(registration))
  }

  employerName (): string {
    return this.dbo.agreement.employerName
  }
}

export default CheckedCard
