import ActorId from '../domain/ActorId'
import Actor from './Actor'
import CardActorInfo from './CardActorInfo'

class CustomerActor implements Actor {
  private readonly actorId: ActorId;

  private readonly actorInfo: CardActorInfo;

  constructor (actorId: ActorId, actorInfo: CardActorInfo) {
    this.actorId = actorId
    this.actorInfo = actorInfo
  }

  id (): ActorId {
    return this.actorId
  }

  info (): CardActorInfo {
    return this.actorInfo
  }
}

export default CustomerActor
