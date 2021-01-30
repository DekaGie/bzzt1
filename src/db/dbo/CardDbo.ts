import {
  Column, Entity, OneToOne, PrimaryColumn
} from 'typeorm'
import CardRegistrationDbo from './CardRegistrationDbo'

@Entity()
class CardDbo {
  @PrimaryColumn()
  cardNumber: number;

  @OneToOne(
    () => CardRegistrationDbo,
    (registration) => registration.card,
    { nullable: true }
  )
  registration: CardRegistrationDbo | null;

  @Column({ type: 'double precision', nullable: false })
  validUntilEs: number;

  @Column({ type: 'text', nullable: false, default: '' })
  manualAnnotation: string;
}

export default CardDbo
