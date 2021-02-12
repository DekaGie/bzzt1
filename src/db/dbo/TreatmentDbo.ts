import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryColumn
} from 'typeorm'
import PackageDbo from './PackageDbo'

@Entity()
class TreatmentDbo {
  @PrimaryColumn()
  treatmentName: string;

  @Column(
    {
      type: 'text',
      nullable: false
    }
  )
  displayName: string;

  @ManyToOne(
    () => PackageDbo,
    { nullable: false, onDelete: 'CASCADE' }
  )
  @JoinColumn()
  package: PackageDbo;

  @Column(
    {
      type: 'text',
      nullable: false,
      default: ''
    }
  )
  manualAnnotation: string;
}

export default TreatmentDbo
