import ActorId from '../domain/ActorId'
import Actor from './Actor'
import CardActorInfo from './CardActorInfo'

class GentlemanActor implements Actor {
  private readonly actorId: ActorId;

  private readonly actorInfo: CardActorInfo;

  private readonly premium: boolean;

  constructor (actorId: ActorId, actorInfo: CardActorInfo, premium: boolean) {
    this.actorId = actorId
    this.actorInfo = actorInfo
    this.premium = premium
  }

  id (): ActorId {
    return this.actorId
  }

  info (): CardActorInfo {
    return this.actorInfo
  }

  isPremium (): boolean {
    return this.premium
  }
}

export default GentlemanActor
