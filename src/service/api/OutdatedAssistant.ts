import ActorAssistant from './ActorAssistant'
import CustomerTexts from '../text/CustomerTexts'
import Reactions from '../spi/Reactions'
import Inquiry from '../spi/Inquiry'
import Reaction from '../spi/Reaction'
import Results from '../util/Results'
import OutdatedActor from '../domain/OutdatedActor'

class OutdatedAssistant implements ActorAssistant<OutdatedActor> {
  handle (actor: OutdatedActor, inquiry: Inquiry): Promise<Array<Reaction>> {
    return Results.many(
      Reactions.plainText(CustomerTexts.outdatedCard(actor.info(), actor.wasValidUntil()))
    )
  }
}

export default OutdatedAssistant
