import {Optional} from 'typescript-optional'
import CardRegistrationDbo from '../../db/dbo/CardRegistrationDbo'
import CardNumber from './CardNumber'

class CardActorInfo {
  private readonly dbo: CardRegistrationDbo;

  constructor (dbo: CardRegistrationDbo) {
    this.dbo = dbo
  }

  cardNumber (): CardNumber {
    return new CardNumber(this.dbo.card.cardNumber)
  }

  employerName (): string {
    return this.dbo.card.agreement.employerName
  }

  calloutName (): Optional<string> {
    return Optional.ofNullable(this.dbo.identification).map((identification) => identification.firstName)
  }
}

export default CardActorInfo
