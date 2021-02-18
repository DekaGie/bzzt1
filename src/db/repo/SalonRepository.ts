import { EntityRepository, Repository } from 'typeorm'
import SalonDbo from '../dbo/SalonDbo'

@EntityRepository(SalonDbo)
class SalonRepository extends Repository<SalonDbo> {
  findByName (salonName: string): Promise<SalonDbo | undefined> {
    return this.createQueryBuilder('salon')
      .where('salon.salonName = :salonName')
      .setParameters({ salonName })
      .getOne()
  }

  findAvailable (cardNumber: number): Promise<Array<SalonDbo>> {
    return this.createQueryBuilder('salon')
      .leftJoin('salon.salonTreatments', 'salonTreatment')
      .leftJoinAndSelect('salonTreatment.treatment', 'treatment')
      .leftJoinAndSelect('treatment.packet', 'packet')
      .leftJoin('packet.agreementPackets', 'agreementPacket')
      .leftJoin('agreementPacket.agreement', 'agreement')
      .leftJoin('agreement.cards', 'card')
      .where('card.cardNumber = :cardNumber')
      .setParameters({ cardNumber })
      .getMany()
  }
}

export default SalonRepository
