import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryColumn
} from 'typeorm'
import SalonDbo from './SalonDbo'
import TreatmentDbo from './TreatmentDbo'

@Entity()
class SalonTreatmentDbo {
  @PrimaryColumn()
  salonName: string;

  @PrimaryColumn()
  treatmentName: string;

  @ManyToOne(
    () => SalonDbo,
    (salon) => salon.salonTreatments,
    { nullable: false, onDelete: 'CASCADE' }
  )
  @JoinColumn(
    {
      name: 'salonName'
    }
  )
  salon: SalonDbo;

  @ManyToOne(
    () => TreatmentDbo,
    (treatment) => treatment.salonTreatments,
    { nullable: false, onDelete: 'CASCADE' }
  )
  @JoinColumn(
    {
      name: 'treatmentName'
    }
  )
  treatment: TreatmentDbo;

  @Column(
    {
      type: 'text',
      nullable: false,
      default: ''
    }
  )
  manualAnnotation: string;
}

export default SalonTreatmentDbo
