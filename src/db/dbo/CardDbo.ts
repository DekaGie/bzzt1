import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn
} from 'typeorm'
import CardRegistrationDbo from './CardRegistrationDbo'
import AgreementDbo from './AgreementDbo'

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

  @ManyToOne(
    () => AgreementDbo,
    { nullable: false, onDelete: 'RESTRICT' }
  )
  @JoinColumn()
  agreement: AgreementDbo;

  @Column(
    {
      type: 'text',
      nullable: false,
      default: ''
    }
  )
  manualAnnotation: string;
}

export default CardDbo
