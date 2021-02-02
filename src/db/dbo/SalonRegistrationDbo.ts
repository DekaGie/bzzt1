import {
  Entity, JoinColumn, ManyToOne, PrimaryColumn
} from 'typeorm'
import SalonDbo from './SalonDbo'

@Entity()
class SalonRegistrationDbo {
  @PrimaryColumn()
  customerId: string;

  @ManyToOne(
    () => SalonDbo,
    { nullable: false, onDelete: 'CASCADE' }
  )
  @JoinColumn()
  salon: SalonDbo;
}

export default SalonRegistrationDbo
