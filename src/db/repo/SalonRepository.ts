import { EntityRepository, Repository } from 'typeorm'
import SalonDbo from '../dbo/SalonDbo'

@EntityRepository(SalonDbo)
class SalonRepository extends Repository<SalonDbo> {
  findBySecret (salonSecret: string): Promise<SalonDbo | undefined> {
    return this.createQueryBuilder('salon')
      .where('salon.salonSecret = :salonSecret')
      .setParameters({ salonSecret })
      .getOne()
  }

  findAvailable (cardNumber: number): Promise<Array<SalonDbo>> {
    return this.createQueryBuilder('salon')
      .leftJoinAndSelect('salon.salonTreatments', 'salonTreatment')
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
