import CardNumber from '../domain/CardNumber'
import TreatmentExecutionRepository
  from '../../db/repo/TreatmentExecutionRepository'
import SalonName from '../domain/SalonName'
import TreatmentName from '../domain/TreatmentName'
import TreatmentExecutionDbo from '../../db/dbo/TreatmentExecutionDbo'
import Instant from '../domain/Instant'

class VisitRegistrator {
  private readonly treatmentExecutionRepository: TreatmentExecutionRepository;

  constructor (treatmentExecutionRepository: TreatmentExecutionRepository) {
    this.treatmentExecutionRepository = treatmentExecutionRepository
  }

  register (salonName: SalonName, cardNumber: CardNumber, treatments: Array<TreatmentName>): Promise<void> {
    const at: Instant = Instant.now()
    return Promise.all(
      treatments.map(
        (treatment, index) => {
          const execution: TreatmentExecutionDbo = new TreatmentExecutionDbo()
          execution.salonName = salonName.toRepresentation()
          execution.treatmentName = treatment.toRepresentation()
          execution.cardNumber = cardNumber.asNumber()
          execution.atEs = at.asEs()
          execution.index = index
          return this.treatmentExecutionRepository.save(execution)
        }
      )
    ).then(() => {})
  }
}

export default VisitRegistrator
