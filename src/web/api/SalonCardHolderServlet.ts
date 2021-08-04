import { Connection } from 'typeorm'
import TreatmentResolver from '../../service/api/TreatmentResolver'
import TreatmentRepository from '../../db/repo/TreatmentRepository'
import HttpServlet from '../../http/HttpServlet'
import HttpRequest from '../../http/HttpRequest'
import HttpResponse from '../../http/HttpResponse'
import SalonContextResolver from './SalonContextResolver'
import SalonName from '../../service/domain/SalonName'
import CardContextResolver from './CardContextResolver'
import ResolvedCard from './ResolvedCard'
import Logger from '../../log/Logger'
import Loggers from '../../log/Loggers'

class SalonCardHolderServlet implements HttpServlet {
  private static readonly LOG: Logger = Loggers.get(SalonCardHolderServlet.name)

  private readonly salons: SalonContextResolver;

  private readonly treatments: TreatmentResolver;

  private readonly cards: CardContextResolver;

  constructor (db: Connection) {
    this.salons = new SalonContextResolver(db)
    this.cards = new CardContextResolver(db)
    this.treatments = new TreatmentResolver(
      db.getCustomRepository(TreatmentRepository)
    )
  }

  handle (request: HttpRequest): Promise<HttpResponse> {
    const salonPromise: Promise<SalonName> = this.salons.resolve(request)
    const cardPromise: Promise<ResolvedCard> = this.cards.resolve(request)
    return Promise.all([salonPromise, cardPromise]).then(
      (all) => {
        const salon: SalonName = all[0]
        const card: ResolvedCard = all[1]
        SalonCardHolderServlet.LOG.info(`finding treatments offered by ${salon} to ${card.cardNumber()}`)
        return this.treatments.findOffered(salon, card.cardNumber()).then(
          (treatments) => {
            return {
              code: 200,
              body: {
                identity: card.holder().personalData()
                  .map(
                    (personalData) => ({
                      name: personalData.fullName(),
                      imageUrl: personalData.picture()
                        .map((url) => url.asString())
                        .orUndefined()
                    })
                  )
                  .orUndefined(),
                includedTreatmentIds: treatments
                  .map((treatment) => treatment.name().toRepresentation())
              }
            }
          }
        )
      }
    )
  }
}

export default SalonCardHolderServlet
