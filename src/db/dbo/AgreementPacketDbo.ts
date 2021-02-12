import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryColumn
} from 'typeorm'
import AgreementDbo from './AgreementDbo'
import PacketDbo from './PacketDbo'

@Entity()
class AgreementPacketDbo {
  @PrimaryColumn()
  employerName: string;

  @PrimaryColumn()
  packetName: string;

  @ManyToOne(
    () => AgreementDbo,
    (agreement) => agreement.agreementPackets,
    { nullable: false, onDelete: 'CASCADE' }
  )
  @JoinColumn(
    {
      name: 'employerName'
    }
  )
  agreement: AgreementDbo;

  @ManyToOne(
    () => PacketDbo,
    (packet) => packet.agreementPackets,
    { nullable: false, onDelete: 'CASCADE' }
  )
  @JoinColumn(
    {
      name: 'packetName'
    }
  )
  packet: PacketDbo;

  @Column(
    {
      type: 'text',
      nullable: false,
      default: ''
    }
  )
  manualAnnotation: string;
}

export default AgreementPacketDbo
