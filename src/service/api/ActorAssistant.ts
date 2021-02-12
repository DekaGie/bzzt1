import Inquiry from '../spi/Inquiry'
import Reaction from '../spi/Reaction'

interface ActorAssistant<C> {
  handle (context: C, inquiry: Inquiry): Promise<Array<Reaction>>
}

export default ActorAssistant
