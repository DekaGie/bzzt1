import {
  Column, Entity, JoinColumn, JoinOptions, OneToOne, PrimaryColumn
} from 'typeorm'
import CardDbo from './CardDbo'

@Entity()
class CardRegistrationDbo {
  static readonly WITH_CARD: JoinOptions = {
    alias: 'registration',
    leftJoinAndSelect: {
      card: 'registration.card'
    }
  }

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
