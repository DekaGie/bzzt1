import { Connection } from 'typeorm'
import ApiSafeError from './ApiSafeError'
import TreatmentResolver from '../../service/api/TreatmentResolver'
import TreatmentRepository from '../../db/repo/TreatmentRepository'
import SalonResolver from '../../service/api/SalonResolver'
import SalonRepository from '../../db/repo/SalonRepository'
import HttpServlet from '../../http/HttpServlet'
import HttpRequest from '../../http/HttpRequest'
import HttpResponse from '../../http/HttpResponse'

class SalonTreatmentsServlet implements HttpServlet {
  private readonly salons: SalonResolver;

  private readonly treatments: TreatmentResolver;

  constructor (db: Connection) {
    this.salons = new SalonResolver(
      db.getCustomRepository(SalonRepository)
    )
    this.treatments = new TreatmentResolver(
      db.getCustomRepository(TreatmentRepository)
    )
  }

  handle (request: HttpRequest): Promise<HttpResponse> {
    const salonSecret: string = request.query.optional('salon_secret').orElseThrow(
      () => new ApiSafeError('missing_secret', 'Brak hasła salonu.')
    )
    return this.salons.findNameBySecret(salonSecret)
      .then(
        (found) => found.map(
          (salonName) => this.treatments.findAllOffered(salonName)
        ).orElseThrow(
          () => new ApiSafeError('invalid_secret', 'Błędne hasło salonu.')
        )
      )
      .then(
        (treatments) => ({
          code: 200,
          body: treatments.map(
            (treatment) => ({
              id: treatment.name().toRepresentation(),
              label: treatment.fullName()
            })
          )
        })
      )
  }
}

export default SalonTreatmentsServlet
