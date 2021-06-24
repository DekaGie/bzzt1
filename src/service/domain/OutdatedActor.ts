import ActorId from '../domain/ActorId'
import Actor from './Actor'
import CardActorInfo from './CardActorInfo'
import Instant from './Instant'

class OutdatedActor implements Actor {
  private readonly actorId: ActorId;

  private readonly actorInfo: CardActorInfo;

  private readonly until: Instant;

  constructor (actorId: ActorId, actorInfo: CardActorInfo, until: Instant) {
    this.actorId = actorId
    this.actorInfo = actorInfo
    this.until = until
  }

  id (): ActorId {
    return this.actorId
  }

  info (): CardActorInfo {
    return this.actorInfo
  }

  wasValidUntil (): Instant {
    return this.until
  }
}

export default OutdatedActor
