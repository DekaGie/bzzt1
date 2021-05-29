import { Connection } from 'typeorm'
import { Optional } from 'typescript-optional'
import TreatmentResolver from '../../service/api/TreatmentResolver'
import TreatmentRepository from '../../db/repo/TreatmentRepository'
import HttpServlet from '../../http/HttpServlet'
import HttpRequest from '../../http/HttpRequest'
import HttpResponse from '../../http/HttpResponse'
import SalonContextResolver from './SalonContextResolver'
import ApiSafeError from './ApiSafeError'
import CardChecker from '../../service/api/CardChecker'
import CardRepository from '../../db/repo/CardRepository'
import CheckedCard from '../../service/domain/CheckedCard'
import SalonName from '../../service/domain/SalonName'
import Instant from '../../service/domain/Instant'

class SalonCardHolderServlet implements HttpServlet {
  private readonly salons: SalonContextResolver;

  private readonly treatments: TreatmentResolver;

  private readonly cards: CardChecker;

  constructor (db: Connection) {
    this.salons = new SalonContextResolver(db)
    this.cards = new CardChecker(db.getCustomRepository(CardRepository))
    this.treatments = new TreatmentResolver(
      db.getCustomRepository(TreatmentRepository)
    )
  }

  handle (request: HttpRequest): Promise<HttpResponse> {
    const salonPromise: Promise<SalonName> = this.salons.resolve(request)
    const cardNumber: number = Optional.of(request.path.part('card_number'))
      .map((string) => Number.parseInt(string, 10))
      .filter((number) => !Number.isNaN(number))
      .orElseThrow(
        () => new ApiSafeError('invalid_number', 'Błędny numer.')
      )
    const cardPromise: Promise<CheckedCard> = this.cards.check(cardNumber)
      .then(
        (found) => found.orElseThrow(
          () => new ApiSafeError('invalid_card_number', 'Błędny numer karty.')
        )
      )
      .then(
        (checkedCard) => {
          if (Instant.now().isAtOrAfter(checkedCard.validUntil())) {
            throw new ApiSafeError('outdated_card', `Karta utraciła ważność ${checkedCard.validUntil()}`)
          }
          return checkedCard
        }
      )
    return Promise.all([salonPromise, cardPromise]).then(
      (all) => {
        const card: CheckedCard = all[1]
        return this.treatments.findOffered(all[0], card.cardNumber()).then(
          (treatments) => ({
            code: 200,
            body: {
              identity: card.holder()
                .flatMap((cardHolder) => cardHolder.personalData())
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
