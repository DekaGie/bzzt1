import TreatmentDbo from '../../db/dbo/TreatmentDbo'
import TreatmentName from './TreatmentName'

class OfferedTreatment {
  private readonly dbo: TreatmentDbo;

  constructor (dbo: TreatmentDbo) {
    this.dbo = dbo
  }

  fullName (): string {
    return `${this.dbo.packet.displayName}: ${this.dbo.displayName}`
  }

  name (): TreatmentName {
    return new TreatmentName(this.dbo.treatmentName)
  }
}

export default OfferedTreatment
