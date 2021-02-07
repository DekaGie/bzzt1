import { Optional } from 'typescript-optional'
import Reaction from './Reaction'
import ImageUrl from '../domain/ImageUrl'
import Choice from './Choice'

interface RichChoiceReactionData {

  topImage: Optional<ImageUrl>,

  title: string,

  subtitle: Optional<string>,

  choices: Array<Choice>
}

interface RichChoiceReaction extends Reaction, RichChoiceReactionData {

  type: 'RICH_CHOICE',
}

// eslint-disable-next-line import/prefer-default-export
export { RichChoiceReactionData }

export default RichChoiceReaction
