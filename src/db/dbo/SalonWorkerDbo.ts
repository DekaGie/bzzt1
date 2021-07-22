import {
  Column,
  Entity, JoinColumn, ManyToOne, PrimaryColumn
} from 'typeorm'
import SalonDbo from './SalonDbo'

@Entity()
class SalonWorkerDbo {
  @PrimaryColumn()
  email: string;

  @ManyToOne(
    () => SalonDbo,
    { nullable: false, onDelete: 'CASCADE' }
  )
  @JoinColumn()
  salon: SalonDbo;

  @Column(
    {
      type: 'text',
      nullable: false,
      default: ''
    }
  )
  manualAnnotation: string;
}

export default SalonWorkerDbo
