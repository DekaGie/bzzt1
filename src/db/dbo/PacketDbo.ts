import {
  Column, Entity, OneToMany, PrimaryColumn
} from 'typeorm'
import TreatmentDbo from './TreatmentDbo'
import AgreementPacketDbo from './AgreementPacketDbo'

@Entity()
class PacketDbo {
  @PrimaryColumn()
  packetName: string;

  @Column({ type: 'text', nullable: false })
  displayName: string;

  @Column({ type: 'text', nullable: false, default: '' }) // TODO: remove after migration
  pictureUrl: string;

  @OneToMany(
    () => TreatmentDbo,
    (treatment) => treatment.packet
  )
  treatments: Array<TreatmentDbo>;

  @OneToMany(
    () => AgreementPacketDbo,
    (agreementPacket) => agreementPacket.packet
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

export default PacketDbo
