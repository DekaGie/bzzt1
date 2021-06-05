import { Optional } from 'typescript-optional'
import ActorId from '../domain/ActorId'
import CardRegistrationDbo from '../../db/dbo/CardRegistrationDbo'
import CardNumber from './CardNumber'
import Actor from './Actor'
import Instant from './Instant'

class CustomerActor implements Actor {
  private readonly dbo: CardRegistrationDbo;

  constructor (dbo: CardRegistrationDbo) {
    this.dbo = dbo
  }

  id (): ActorId {
    return new ActorId(this.dbo.actorId)
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

  hasValidCardAt (instant: Instant): boolean {
    return !instant.isAtOrAfter(new Instant(this.dbo.card.agreement.validUntilEs))
  }
}

export default CustomerActor
