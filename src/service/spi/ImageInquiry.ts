import Inquiry from './Inquiry'
import ImageUrl from '../domain/ImageUrl'

interface ImageInquiry extends Inquiry {

  type: 'IMAGE',

  imageUrl: ImageUrl
}

export default ImageInquiry
