import {
  Column, Entity, OneToMany, PrimaryColumn
} from 'typeorm'
import AgreementPacketDbo from './AgreementPacketDbo'
import CardDbo from './CardDbo'

@Entity()
class AgreementDbo {
  @PrimaryColumn()
  employerName: string;

  @Column({ type: 'double precision', nullable: false })
  validUntilEs: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  gentleman: boolean;

  @OneToMany(
    () => AgreementPacketDbo,
    (agreementPacket) => agreementPacket.agreement
  )
  agreementPackets: Array<AgreementPacketDbo>;

  @OneToMany(
    () => CardDbo,
    (card) => card.agreement
  )
  cards: Array<CardDbo>;

  @Column(
    {
      type: 'text',
      nullable: false,
      default: ''
    }
  )
  manualAnnotation: string;
}

export default AgreementDbo
