import ActorAssistant from './ActorAssistant'
import SalonAssistant from './SalonAssistant'
import ActorId from '../domain/ActorId'
import UnregisteredActorAssistant from './UnregisteredActorAssistant'
import Inquiry from '../spi/Inquiry'
import Reaction from '../spi/Reaction'
import CustomerAssistant from './CustomerAssistant'
import SalonActor from '../domain/SalonActor'
import ActorResolver from './ActorResolver'
import Actor from '../domain/Actor'
import CustomerActor from '../domain/CustomerActor'

class BusinessAssistant implements ActorAssistant<ActorId> {
  private readonly actorResolver: ActorResolver;

  private readonly salonAssistant: SalonAssistant;

  private readonly customerAssistant: CustomerAssistant;

  private readonly unregisteredActorAssistant: UnregisteredActorAssistant;

  constructor (
    actorResolver: ActorResolver,
    salonAssistant: SalonAssistant,
    customerAssistant: CustomerAssistant,
    unregisteredActorAssistant: UnregisteredActorAssistant
  ) {
    this.actorResolver = actorResolver
    this.salonAssistant = salonAssistant
    this.customerAssistant = customerAssistant
    this.unregisteredActorAssistant = unregisteredActorAssistant
  }

  handle (actorId: ActorId, inquiry: Inquiry): Promise<Array<Reaction>> {
    return this.actorResolver.resolve(actorId).then(
      (optionalActor) => {
        if (!optionalActor.isPresent()) {
          return this.unregisteredActorAssistant.handle(actorId, inquiry)
        }
        const actor: Actor = optionalActor.get()
        if (actor instanceof SalonActor) {
          return this.salonAssistant.handle(actor, inquiry)
        }
        if (actor instanceof CustomerActor) {
          return this.customerAssistant.handle(actor, inquiry)
        }
        throw new Error(`unknown actor type (${actor}) of ${actorId}`)
      }
    )
  }
}

export default BusinessAssistant
