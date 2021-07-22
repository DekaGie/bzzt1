import { Optional } from 'typescript-optional'
import CardNumber from '../domain/CardNumber'
import SalonRepository from '../../db/repo/SalonRepository'
import AvailableSalon from '../domain/AvailableSalon'
import SalonName from '../domain/SalonName'
import SalonWorkerRepository from '../../db/repo/SalonWorkerRepository'

class SalonResolver {
  private readonly salonRepository: SalonRepository;

  private readonly salonWorkerRepository: SalonWorkerRepository;

  constructor (salonRepository: SalonRepository, salonWorkerRepository: SalonWorkerRepository) {
    this.salonRepository = salonRepository
    this.salonWorkerRepository = salonWorkerRepository
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

  findNameByEmail (email: string): Promise<Optional<SalonName>> {
    return this.salonWorkerRepository.findFull(email)
      .then(Optional.ofNullable)
      .then((found) => found.map((dbo) => new SalonName(dbo.salon.salonName)))
  }
}

export default SalonResolver
