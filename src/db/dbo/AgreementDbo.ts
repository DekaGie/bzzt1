import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
class AgreementDbo {
  @PrimaryColumn()
  employerName: string;

  @Column({ type: 'double precision', nullable: false })
  validUntilEs: number;

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
