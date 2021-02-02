import {
  Column, Entity, JoinColumn, OneToOne, PrimaryColumn
} from 'typeorm'
import CardRegistrationDbo from './CardRegistrationDbo'

@Entity()
class IdentificationDbo {
  @PrimaryColumn()
  customerId: string;

  @OneToOne(
    () => CardRegistrationDbo,
    (registration) => registration.identification,
    { nullable: true }
  )
  @JoinColumn(
    {
      name: 'customerId'
    }
  )
  registration: CardRegistrationDbo | null;

  @Column({ type: 'text', nullable: false })
  firstName: string;

  @Column({ type: 'text', nullable: false })
  lastName: string;

  @Column({ type: 'text', nullable: false })
  pictureUrl: string;
}

export default IdentificationDbo
