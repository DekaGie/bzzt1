import {
  Column, Entity, JoinColumn, OneToOne, PrimaryColumn
} from 'typeorm'
import CardDbo from './CardDbo'

@Entity()
class CardRegistrationDbo {
  @PrimaryColumn()
  customerId: string;

  @OneToOne(
    () => CardDbo,
    (card) => card.registration,
    { nullable: false, onDelete: 'RESTRICT' }
  )
  @JoinColumn()
  card: CardDbo;

  @Column('text')
  manualAnnotation: string;
}

export default CardRegistrationDbo
