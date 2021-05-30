import {
  Entity, JoinColumn, ManyToOne, PrimaryColumn
} from 'typeorm'
import SalonDbo from './SalonDbo'
import TreatmentDbo from './TreatmentDbo'
import CardDbo from './CardDbo'

@Entity()
class TreatmentExecutionDbo {
  @PrimaryColumn()
  salonName: string;

  @PrimaryColumn()
  treatmentName: string;

  @PrimaryColumn()
  cardNumber: number;

  @PrimaryColumn({ type: 'double precision', nullable: false })
  atEs: number;

  @PrimaryColumn()
  index: number;

  @ManyToOne(
    () => SalonDbo,
    { nullable: false, onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'salonName' })
  salon: SalonDbo;

  @ManyToOne(
    () => TreatmentDbo,
    { nullable: false, onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'treatmentName' })
  treatment: TreatmentDbo;

  @ManyToOne(
    () => CardDbo,
    { nullable: false, onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'cardNumber' })
  card: CardDbo;
}

export default TreatmentExecutionDbo
