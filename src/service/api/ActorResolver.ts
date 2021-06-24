import { Optional } from 'typescript-optional'
import CardRegistrationRepository from '../../db/repo/CardRegistrationRepository'
import SalonRegistrationRepository from '../../db/repo/SalonRegistrationRepository'
import ActorId from '../domain/ActorId'
import SalonActor from '../domain/SalonActor'
import Actor from '../domain/Actor'
import CustomerActor from '../domain/CustomerActor'
import Promises from '../../util/Promises'
import Instant from '../domain/Instant'
import CardRegistrationDbo from '../../db/dbo/CardRegistrationDbo'
import GentlemanActor from '../domain/GentlemanActor'
import PacketRepository from '../../db/repo/PacketRepository'
import OutdatedActor from '../domain/OutdatedActor'
import CardActorInfo from '../domain/CardActorInfo'

class ActorResolver {
  private readonly cardRegistrationRepository: CardRegistrationRepository;

  private readonly salonRegistrationRepository: SalonRegistrationRepository;

  private readonly packetRepository: PacketRepository;

  constructor (
    salonRegistrationRepository: SalonRegistrationRepository,
    cardRegistrationRepository: CardRegistrationRepository,
    packetRepository: PacketRepository
  ) {
    this.salonRegistrationRepository = salonRegistrationRepository
    this.cardRegistrationRepository = cardRegistrationRepository
    this.packetRepository = packetRepository
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

  private resolveCustomer (actorId: ActorId): Promise<Optional<Actor>> {
    return this.cardRegistrationRepository.findFull(actorId.toRepresentation())
      .then(Optional.ofNullable)
      .then(
        (optionalDbo) => optionalDbo.map(
          (dbo) => this.resolveSpecificCustomer(dbo)
            .then((actor) => Optional.of(actor))
        ).orElseGet(() => Promise.resolve(Optional.empty()))
      )
  }

  private resolveSpecificCustomer (dbo: CardRegistrationDbo): Promise<Actor> {
    const id: ActorId = new ActorId(dbo.actorId)
    const info: CardActorInfo = new CardActorInfo(dbo)
    const until: Instant = new Instant(dbo.card.agreement.validUntilEs)
    if (Instant.now().isAtOrAfter(until)) {
      return Promise.resolve(new OutdatedActor(id, info, until))
    }
    if (dbo.card.agreement.gentleman) {
      this.packetRepository.countAvailable(dbo.card.cardNumber).then(
        (count) => new GentlemanActor(id, info, count > 1)
      )
    }
    return Promise.resolve(new CustomerActor(id, info))
  }
}

export default ActorResolver
