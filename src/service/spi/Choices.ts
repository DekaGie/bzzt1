import { InquiryChoice, LinkChoice, PhoneChoice } from './Choice'
import Inquiry from './Inquiry'

class Choices {
  static readonly LIMIT: number = 3;

  static inquiry<T extends Inquiry> (label: string, inquiry: T): InquiryChoice {
    return { type: 'INQUIRY', label, inquiry }
  }

  static phone (label: string, phone: string): PhoneChoice {
    return { type: 'PHONE', label, phone }
  }

  static link (label: string, url: string): LinkChoice {
    return { type: 'LINK', label, url }
  }
}

export default Choices
