import CardNumber from '../domain/CardNumber'
import SalonRepository from '../../db/repo/SalonRepository'
import AvailableSalon from '../domain/AvailableSalon'

class SalonResolver {
  private readonly salonRepository: SalonRepository;

  constructor (salonRepository: SalonRepository) {
    this.salonRepository = salonRepository
  }

  findAvailable (cardNumber: CardNumber): Promise<Array<AvailableSalon>> {
    return this.salonRepository.findAvailable(cardNumber.asNumber())
      .then((dbos) => dbos.map((dbo) => new AvailableSalon(dbo)))
  }
}

export default SalonResolver
