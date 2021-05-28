import { Optional } from 'typescript-optional'
import CardNumber from '../domain/CardNumber'
import SalonRepository from '../../db/repo/SalonRepository'
import AvailableSalon from '../domain/AvailableSalon'
import SalonName from '../domain/SalonName'

class SalonResolver {
  private readonly salonRepository: SalonRepository;

  constructor (salonRepository: SalonRepository) {
    this.salonRepository = salonRepository
  }

  findAvailable (cardNumber: CardNumber): Promise<Array<AvailableSalon>> {
    return this.salonRepository.findAvailable(cardNumber.asNumber())
      .then((dbos) => dbos.map((dbo) => new AvailableSalon(dbo)))
  }

  findNameBySecret (salonSecret: string): Promise<Optional<SalonName>> {
    return this.salonRepository.findBySecret(salonSecret)
      .then(Optional.ofNullable)
      .then((found) => found.map((dbo) => new SalonName(dbo.salonName)))
  }
}

export default SalonResolver
