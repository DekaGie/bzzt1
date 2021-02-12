import { Optional } from 'typescript-optional'
import ActorId from '../domain/ActorId'
import CardRegistrationDbo from '../../db/dbo/CardRegistrationDbo'
import CardNumber from './CardNumber'
import Actor from './Actor'

class CustomerActor implements Actor {
  private readonly dbo: CardRegistrationDbo;

  constructor (dbo: CardRegistrationDbo) {
    this.dbo = dbo
  }

  id (): ActorId {
    return new ActorId(this.dbo.actorId)
  }

  fullName (): string {
    return `${this.dbo.identification.firstName} ${this.dbo.identification.lastName}`
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

export default CustomerActor
