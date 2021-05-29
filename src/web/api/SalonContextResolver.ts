import { Connection } from 'typeorm'
import ApiSafeError from './ApiSafeError'
import SalonResolver from '../../service/api/SalonResolver'
import SalonRepository from '../../db/repo/SalonRepository'
import HttpRequest from '../../http/HttpRequest'
import SalonName from '../../service/domain/SalonName'

class SalonContextResolver {
  private readonly salons: SalonResolver;

  constructor (db: Connection) {
    this.salons = new SalonResolver(
      db.getCustomRepository(SalonRepository)
    )
  }

  resolve (request: HttpRequest): Promise<SalonName> {
    const salonSecret: string = request.query.mandatory('salon_secret')
    return this.salons.findNameBySecret(salonSecret)
      .then(
        (found) => found.orElseThrow(
          () => new ApiSafeError('invalid_secret', 'Błędne hasło salonu.')
        )
      )
  }
}

export default SalonContextResolver
