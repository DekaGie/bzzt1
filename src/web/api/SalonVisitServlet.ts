import { Connection } from 'typeorm'
import TreatmentResolver from '../../service/api/TreatmentResolver'
import TreatmentRepository from '../../db/repo/TreatmentRepository'
import HttpServlet from '../../http/HttpServlet'
import HttpRequest from '../../http/HttpRequest'
import HttpResponse from '../../http/HttpResponse'
import SalonContextResolver from './SalonContextResolver'
import ApiSafeError from './ApiSafeError'
import SalonName from '../../service/domain/SalonName'
import CardContextResolver from './CardContextResolver'
import ResolvedCard from './ResolvedCard'
import TreatmentName from '../../service/domain/TreatmentName'
import Logger from '../../log/Logger'
import Loggers from '../../log/Loggers'
import OfferedTreatment from '../../service/domain/OfferedTreatment'

class SalonVisitServlet implements HttpServlet {
  private static readonly LOG: Logger = Loggers.get(SalonVisitServlet.name)

  private readonly salons: SalonContextResolver;

  private readonly cards: CardContextResolver;

  private readonly treatments: TreatmentResolver;

  constructor (db: Connection) {
    this.salons = new SalonContextResolver(db)
    this.cards = new CardContextResolver(db)
    this.treatments = new TreatmentResolver(db.getCustomRepository(TreatmentRepository))
  }

  handle (request: HttpRequest): Promise<HttpResponse> {
    const treatmentNames: Array<TreatmentName> = request.body.asJson()
      .asObject()
      .mandatory('performedTreatmentIds')
      .asArray()
      .map((element) => element.asString())
      .map((string) => new TreatmentName(string))
    const salonPromise: Promise<SalonName> = this.salons.resolve(request)
    const cardPromise: Promise<ResolvedCard> = this.cards.resolve(request)
    const treatmentsPromise: Promise<Array<OfferedTreatment>> = this.treatments.get(treatmentNames)
    return Promise.all([salonPromise, cardPromise, treatmentsPromise]).then(
      (all) => {
        const salon: SalonName = all[0]
        const card: ResolvedCard = all[1]
        const treatments: Array<OfferedTreatment> = all[2]
        const accepted: Array<TreatmentName> = treatments.map((treatment) => treatment.name())
        const foundNames: Set<string> = new Set(accepted.map((name) => name.toRepresentation()))
        treatmentNames.forEach(
          (treatmentName) => {
            if (!foundNames.has(treatmentName.toRepresentation())) {
              throw new ApiSafeError('treatment_not_found', `Nie istnieje zabieg ${treatmentName.toRepresentation()}`)
            }
          }
        )
        SalonVisitServlet.LOG.info(`salon ${salon} successfully accepted ${card.cardNumber()} for ${accepted}`)
        return {
          code: 200,
          body: {
            success: true
          }
        }
      }
    )
  }
}

export default SalonVisitServlet
