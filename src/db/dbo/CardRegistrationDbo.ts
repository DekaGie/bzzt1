import {
  Column, Entity, JoinColumn, OneToOne, PrimaryColumn
} from 'typeorm'
import CardDbo from './CardDbo'
import IdentificationDbo from './IdentificationDbo'

@Entity()
class CardRegistrationDbo {
  @PrimaryColumn()
  actorId: string;

  @OneToOne(
    () => CardDbo,
    (card) => card.registration,
    { nullable: false, onDelete: 'RESTRICT' }
  )
  @JoinColumn()
  card: CardDbo;

  @OneToOne(
    () => IdentificationDbo,
    (identification) => identification.registration,
    { nullable: true }
  )
  identification: IdentificationDbo | null;

  @Column(
    {
      type: 'text',
      nullable: false,
      default: ''
    }
  )
  manualAnnotation: string;
}

export default CardRegistrationDbo
