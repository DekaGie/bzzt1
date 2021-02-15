import Reaction from './Reaction'
import ImageUrl from '../domain/ImageUrl'
import Choice from './Choice'

interface RichChoiceReactionData {

  topImage?: ImageUrl | undefined,

  imageAsSquare?: boolean | undefined,

  title: string,

  subtitle?: string | undefined,

  choices: Array<Choice>
}

interface RichChoiceReaction extends Reaction, RichChoiceReactionData {

  type: 'RICH_CHOICE',
}

// eslint-disable-next-line import/prefer-default-export
export { RichChoiceReactionData }

export default RichChoiceReaction
