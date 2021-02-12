import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
class SalonDbo {
  @PrimaryColumn()
  salonName: string;

  @Column(
    {
      type: 'text',
      nullable: false,
      default: '' // TODO: remove after deploy
    }
  )
  displayName: string;

  @Column({ type: 'text', nullable: false })
  salonSecret: string;

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
