import { EntityRepository, Repository } from 'typeorm'
import TreatmentDbo from '../dbo/TreatmentDbo'

@EntityRepository(TreatmentDbo)
class TreatmentRepository extends Repository<TreatmentDbo> {
  findOffered (salonName: string, cardNumber: number): Promise<Array<TreatmentDbo>> {
    return this.createQueryBuilder('treatment')
      .leftJoin('treatment.salonTreatments', 'salonTreatment')
      .leftJoin('salonTreatment.salon', 'salon')
      .leftJoinAndSelect('treatment.packet', 'packet')
      .leftJoin('packet.agreementPackets', 'agreementPacket')
      .leftJoin('agreementPacket.agreement', 'agreement')
      .leftJoin('agreement.cards', 'card')
      .where('salon.salonName = :salonName')
      .andWhere('card.cardNumber = :cardNumber')
      .setParameters({ salonName, cardNumber })
      .getMany()
  }

  findOfferedDirectly (treatmentNames: Array<string>): Promise<Array<TreatmentDbo>> {
    return this.createQueryBuilder('treatment')
      .leftJoinAndSelect('treatment.packet', 'packet')
      .where('treatment.treatmentName IN (:...treatmentNames)')
      .setParameters({ treatmentNames })
      .getMany()
  }
}

export default TreatmentRepository
