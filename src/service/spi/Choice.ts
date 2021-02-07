import Inquiry from './Inquiry'

interface Choice {

  type: 'INQUIRY' | 'LINK' | 'PHONE',

  label: string
}

interface InquiryChoice extends Choice {

  type: 'INQUIRY',

  inquiry: Inquiry
}

interface PhoneChoice extends Choice {

  type: 'PHONE',

  phone: string
}

interface LinkChoice extends Choice {

  type: 'LINK',

  url: string
}

// eslint-disable-next-line import/prefer-default-export
export { InquiryChoice, PhoneChoice, LinkChoice }

export default Choice
