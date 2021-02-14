import {
  Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn
} from 'typeorm'
import PacketDbo from './PacketDbo'
import SalonTreatmentDbo from './SalonTreatmentDbo'

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

  @OneToMany(
    () => SalonTreatmentDbo,
    (salonTreatment) => salonTreatment.treatment
  )
  salonTreatments: Array<SalonTreatmentDbo>;

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
