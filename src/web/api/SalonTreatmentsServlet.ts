import { Connection } from 'typeorm'
import TreatmentResolver from '../../service/api/TreatmentResolver'
import TreatmentRepository from '../../db/repo/TreatmentRepository'
import HttpServlet from '../../http/HttpServlet'
import HttpRequest from '../../http/HttpRequest'
import HttpResponse from '../../http/HttpResponse'
import SalonContextResolver from './SalonContextResolver'

class SalonTreatmentsServlet implements HttpServlet {
  private readonly salons: SalonContextResolver;

  private readonly treatments: TreatmentResolver;

  constructor (db: Connection) {
    this.salons = new SalonContextResolver(db)
    this.treatments = new TreatmentResolver(
      db.getCustomRepository(TreatmentRepository)
    )
  }

  handle (request: HttpRequest): Promise<HttpResponse> {
    return this.salons.resolve(request)
      .then((salonName) => this.treatments.findAllOffered(salonName))
      .then(
        (treatments) => ({
          code: 200,
          body: {
            offeredTreatments: treatments.map(
              (treatment) => ({
                id: treatment.name().toRepresentation(),
                label: treatment.fullName()
              })
            )
          }
        })
      )
  }
}

export default SalonTreatmentsServlet
