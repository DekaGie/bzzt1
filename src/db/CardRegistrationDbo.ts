import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
class CardRegistrationDbo {
  @PrimaryColumn()
  customerId: string;

  @Column()
  cardNumber: number;

  @Column('text')
  manualAnnotation: string;
}

export default CardRegistrationDbo
