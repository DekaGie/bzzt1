import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryColumn
} from 'typeorm'
import PacketDbo from './PacketDbo'

@Entity()
class TreatmentDbo {
  @PrimaryColumn()
  treatmentName: string;

  @Column(
    {
      type: 'text',
      nullable: false
    }
  )
  displayName: string;

  @ManyToOne(
    () => PacketDbo,
    { nullable: false, onDelete: 'CASCADE' }
  )
  @JoinColumn()
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

export default TreatmentDbo
