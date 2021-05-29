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

class SalonCardHolderServlet implements HttpServlet {
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
        const card: ResolvedCard = all[1]
        return this.treatments.findOffered(all[0], card.cardNumber()).then(
          (treatments) => ({
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
          })
        )
      }
    )
  }
}

export default SalonCardHolderServlet
