import CardNumber from '../domain/CardNumber'
import PacketRepository from '../../db/repo/PacketRepository'
import AvailablePacket from '../domain/AvailablePacket'

class PacketResolver {
  private readonly packetRepository: PacketRepository;

  constructor (packetRepository: PacketRepository) {
    this.packetRepository = packetRepository
  }

  findAvailable (cardNumber: CardNumber): Promise<Array<AvailablePacket>> {
    return this.packetRepository.findAvailable(cardNumber.asNumber())
      .then((dbos) => dbos.map((dbo) => new AvailablePacket(dbo)))
  }
}

export default PacketResolver
