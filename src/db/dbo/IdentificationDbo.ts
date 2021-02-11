import {
  Column, Entity, JoinColumn, OneToOne, PrimaryColumn
} from 'typeorm'
import CardRegistrationDbo from './CardRegistrationDbo'

@Entity()
class IdentificationDbo {
  @PrimaryColumn()
  actorId: string;

  @OneToOne(
    () => CardRegistrationDbo,
    (registration) => registration.identification,
    { nullable: false, onDelete: 'CASCADE' }
  )
  @JoinColumn(
    {
      name: 'actorId'
    }
  )
  registration: CardRegistrationDbo;

  @Column({ type: 'text', nullable: false })
  firstName: string;

  @Column({ type: 'text', nullable: false })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  pictureUrl: string | null;
}

export default IdentificationDbo
