import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
class SalonDbo {
  @PrimaryColumn()
  salonName: string;

  @Column({ type: 'text', nullable: false })
  salonSecret: string;
}

export default SalonDbo
