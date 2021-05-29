import CardNumber from '../domain/CardNumber'
import TreatmentRepository from '../../db/repo/TreatmentRepository'
import OfferedTreatment from '../domain/OfferedTreatment'
import SalonName from '../domain/SalonName'
import TreatmentName from '../domain/TreatmentName'

class TreatmentResolver {
  private readonly treatmentRepository: TreatmentRepository;

  constructor (treatmentRepository: TreatmentRepository) {
    this.treatmentRepository = treatmentRepository
  }

  findAllOffered (salonName: SalonName): Promise<Array<OfferedTreatment>> {
    return this.treatmentRepository.findAllOffered(salonName.toRepresentation())
      .then((dbos) => dbos.map((dbo) => new OfferedTreatment(dbo)))
  }

  findOffered (salonName: SalonName, cardNumber: CardNumber): Promise<Array<OfferedTreatment>> {
    return this.treatmentRepository.findOffered(salonName.toRepresentation(), cardNumber.asNumber())
      .then((dbos) => dbos.map((dbo) => new OfferedTreatment(dbo)))
  }

  get (names: Array<TreatmentName>): Promise<Array<OfferedTreatment>> {
    const treatmentNames: Array<string> = names.map((name) => name.toRepresentation())
    return this.treatmentRepository.findOfferedDirectly(treatmentNames)
      .then((dbos) => dbos.map((dbo) => new OfferedTreatment(dbo)))
  }
}

export default TreatmentResolver
