import { Optional } from 'typescript-optional'
import Converter from '../../util/Converter'
import TreatmentName from './TreatmentName'
import Converters from '../../util/Converters'

class BuiltVisit {
  static readonly JSONIZER: Converter<BuiltVisit, any> = Converters.construct(
    (visit) => ({ treatmentNames: visit.treatmentNames().map((name) => name.toRepresentation()) }),
    (ref) => new BuiltVisit(ref.treatmentNames.map((name) => new TreatmentName(name)))
  )

  private readonly names: Array<TreatmentName>;

  constructor (names: Array<TreatmentName>) {
    this.names = names
  }

  treatmentNames (): Array<TreatmentName> {
    return this.names
  }

  with (treatmentName: TreatmentName): BuiltVisit {
    const found: TreatmentName | undefined = this.names.find(
      (name) => name.toRepresentation() === treatmentName.toRepresentation()
    )
    if (Optional.ofNullable(found).isPresent()) {
      return this
    }
    return new BuiltVisit(this.names.concat(treatmentName))
  }
}

export default BuiltVisit
