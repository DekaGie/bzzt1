import { Connection } from 'typeorm'
import ApiSafeError from './ApiSafeError'
import SalonResolver from '../../service/api/SalonResolver'
import SalonRepository from '../../db/repo/SalonRepository'
import HttpRequest from '../../http/HttpRequest'
import SalonName from '../../service/domain/SalonName'
import SalonSessionTokenManager from './SalonSessionTokenManager'
import HttpError from '../../http/HttpError'

class SalonContextResolver {
  private readonly salons: SalonResolver;

  private readonly manager: SalonSessionTokenManager;

  constructor (db: Connection) {
    this.salons = new SalonResolver(
      db.getCustomRepository(SalonRepository)
    )
    this.manager = new SalonSessionTokenManager()
  }

  resolve (request: HttpRequest): Promise<SalonName> {
    return request.query.optional('session_token')
      .map((token) => Promise.resolve(this.manager.validate(token)))
      .orElseGet(
        () => this.salons.findNameBySecret(
          request.query.optional('salon_secret').orElseThrow(
            () => new HttpError(400, 'Either session_token or salon_secret parameter must be specified')
          )
        ).then(
          (found) => found.orElseThrow(
            () => new ApiSafeError('invalid_secret', 'Błędne hasło salonu.')
          )
        )
      )
  }
}

export default SalonContextResolver
