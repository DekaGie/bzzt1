import Reaction from './Reaction'
import ImageUrl from '../domain/ImageUrl'

interface RichImageReaction extends Reaction {

  type: 'RICH_IMAGE',

  caption: string,

  subtitle?: string | undefined,

  imageUrl: ImageUrl
}

export default RichImageReaction
