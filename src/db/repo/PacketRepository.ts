import { EntityRepository, Repository } from 'typeorm'
import PacketDbo from '../dbo/PacketDbo'

@EntityRepository(PacketDbo)
class PacketRepository extends Repository<PacketDbo> {
  findAvailable (cardNumber: number): Promise<Array<PacketDbo>> {
    return this.createQueryBuilder('packet')
      .leftJoin('packet.agreementPackets', 'agreementPacket')
      .leftJoin('agreementPacket.agreement', 'agreement')
      .leftJoin('agreement.cards', 'card')
      .leftJoinAndSelect('packet.treatments', 'treatments')
      .where('card.cardNumber = :cardNumber')
      .setParameters({ cardNumber })
      .getMany()
  }
}

export default PacketRepository
