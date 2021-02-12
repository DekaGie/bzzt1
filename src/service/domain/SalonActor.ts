import ActorId from '../domain/ActorId'
import SalonRegistrationDbo from '../../db/dbo/SalonRegistrationDbo'
import Actor from './Actor'

class SalonActor implements Actor {
  private readonly dbo: SalonRegistrationDbo;

  constructor (dbo: SalonRegistrationDbo) {
    this.dbo = dbo
  }

  id (): ActorId {
    return new ActorId(this.dbo.actorId)
  }

  displayName (): string {
    return this.dbo.salon.displayName
  }
}

export default SalonActor
