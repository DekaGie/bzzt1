import {
  Column, Entity, OneToMany, PrimaryColumn
} from 'typeorm'
import SalonTreatmentDbo from './SalonTreatmentDbo'

@Entity()
class SalonDbo {
  @PrimaryColumn()
  salonName: string;

  @Column({ type: 'text', nullable: false })
  displayName: string;

  @Column({ type: 'text', nullable: false, default: '' }) // TODO: remove after migration
  pictureUrl: string;

  @Column({ type: 'text', nullable: false, default: '' }) // TODO: remove after migration
  bookingUrl: string;

  @Column({ type: 'text', nullable: false, default: '' }) // TODO: remove after migration
  contactUrl: string;

  @Column({ type: 'text', nullable: false })
  salonSecret: string;

  @OneToMany(
    () => SalonTreatmentDbo,
    (salonTreatment) => salonTreatment.salon
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

export default SalonDbo
