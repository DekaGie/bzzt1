import Inquiry from '../spi/Inquiry'

interface TreatmentContextInquiry extends Inquiry {

  treatmentNames: Array<string>
}

export default TreatmentContextInquiry
