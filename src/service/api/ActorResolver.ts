import { Optional } from 'typescript-optional'
import CardRegistrationRepository
  from '../../db/repo/CardRegistrationRepository'
import SalonRegistrationRepository
  from '../../db/repo/SalonRegistrationRepository'
import ActorId from '../domain/ActorId'
import SalonActor from '../domain/SalonActor'
import Actor from '../domain/Actor'
import CustomerActor from '../domain/CustomerActor'
import Promises from '../../util/Promises'

class ActorResolver {
  private readonly cardRegistrationRepository: CardRegistrationRepository;

  private readonly salonRegistrationRepository: SalonRegistrationRepository;

  constructor (
    salonRegistrationRepository: SalonRegistrationRepository,
    cardRegistrationRepository: CardRegistrationRepository,
  ) {
    this.salonRegistrationRepository = salonRegistrationRepository
    this.cardRegistrationRepository = cardRegistrationRepository
  }

  resolve (actorId: ActorId): Promise<Optional<Actor>> {
    return Promises.optionalFallback<Actor>(
      () => this.resolveSalon(actorId),
      () => this.resolveCustomer(actorId)
    )
  }

  private resolveSalon (actorId: ActorId): Promise<Optional<SalonActor>> {
    return this.salonRegistrationRepository.findFull(actorId.toRepresentation())
      .then(Optional.ofNullable)
      .then((optionalDbo) => optionalDbo.map((dbo) => new SalonActor(dbo)))
  }

  private resolveCustomer (actorId: ActorId): Promise<Optional<CustomerActor>> {
    return this.cardRegistrationRepository.findFull(actorId.toRepresentation())
      .then(Optional.ofNullable)
      .then((optionalDbo) => optionalDbo.map((dbo) => new CustomerActor(dbo)))
  }
}

export default ActorResolver
