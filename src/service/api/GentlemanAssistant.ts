import ActorAssistant from './ActorAssistant'
import CustomerTexts from '../text/CustomerTexts'
import Reactions from '../spi/Reactions'
import Inquiry from '../spi/Inquiry'
import Reaction from '../spi/Reaction'
import Results from '../util/Results'
import GentlemanActor from '../domain/GentlemanActor'

class GenlemanAssistant implements ActorAssistant<GentlemanActor> {
  handle (actor: GentlemanActor, inquiry: Inquiry): Promise<Array<Reaction>> {
    return Results.many(
      Reactions.plainText(CustomerTexts.gentlemanKnowledge(actor.info(), actor.isPremium()))
    )
  }
}

export default GenlemanAssistant
