import Reaction from './Reaction'

interface PlainTextReaction extends Reaction {

  type: 'PLAIN_TEXT',

  plainText: string
}

export default PlainTextReaction
