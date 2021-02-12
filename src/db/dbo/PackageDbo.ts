import {
  Column, Entity, JoinColumn, OneToMany, PrimaryColumn
} from 'typeorm'
import TreatmentDbo from './TreatmentDbo'

@Entity()
class PackageDbo {
  @PrimaryColumn()
  packageName: string;

  @Column(
    {
      type: 'text',
      nullable: false
    }
  )
  displayName: string;

  @OneToMany(
    () => TreatmentDbo,
    (treatment) => treatment.package
  )
  @JoinColumn()
  treatments: Array<TreatmentDbo>;

  @Column(
    {
      type: 'text',
      nullable: false,
      default: ''
    }
  )
  manualAnnotation: string;
}

export default PackageDbo
