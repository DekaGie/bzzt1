import PlainTextReaction from './PlainTextReaction'
import RichChoiceReaction, { RichChoiceReactionData } from './RichChoiceReaction'
import ImageUrl from '../domain/ImageUrl'
import RichImageReaction from './RichImageReaction'

class Reactions {
  static plainText (plainText: string): PlainTextReaction {
    return { type: 'PLAIN_TEXT', plainText }
  }

  static choice (data: RichChoiceReactionData): RichChoiceReaction {
    return { type: 'RICH_CHOICE', ...data }
  }

  static image (imageUrl: ImageUrl, caption: string): RichImageReaction {
    return { type: 'RICH_IMAGE', imageUrl, caption }
  }
}

export default Reactions
