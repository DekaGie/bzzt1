import {
  Column, Entity, OneToMany, PrimaryColumn
} from 'typeorm'
import AgreementPacketDbo from './AgreementPacketDbo'

@Entity()
class AgreementDbo {
  @PrimaryColumn()
  employerName: string;

  @Column({ type: 'double precision', nullable: false })
  validUntilEs: number;

  @OneToMany(
    () => AgreementPacketDbo,
    (agreementPacket) => agreementPacket.agreement
  )
  agreementPackets: Array<AgreementPacketDbo>;

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
