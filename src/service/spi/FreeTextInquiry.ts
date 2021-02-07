import Inquiry from './Inquiry'

interface FreeTextInquiry extends Inquiry {

  type: 'FREE_TEXT',

  freeText: string
}

export default FreeTextInquiry
