import Inquiry from './spi/Inquiry'
import Reaction from './spi/Reaction'

interface CustomerAssistant<C> {
  handle (context: C, inquiry: Inquiry): Promise<Array<Reaction>>
}

export default CustomerAssistant
