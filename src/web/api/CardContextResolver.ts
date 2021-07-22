import { Connection } from 'typeorm'
import { Optional } from 'typescript-optional'
import ApiSafeError from './ApiSafeError'
import HttpRequest from '../../http/HttpRequest'
import CardChecker from '../../service/api/CardChecker'
import CardRepository from '../../db/repo/CardRepository'
import Instant from '../../service/domain/Instant'
import ResolvedCard from './ResolvedCard'

class CardContextResolver {
  private readonly cards: CardChecker;

  constructor (db: Connection) {
    this.cards = new CardChecker(db.getCustomRepository(CardRepository))
  }

  resolve (request: HttpRequest): Promise<ResolvedCard> {
    const cardNumber: number = Optional.of(request.path.part('card_number'))
      .map((string) => Number.parseInt(string, 10))
      .filter((number) => !Number.isNaN(number))
      .orElseThrow(
        () => new ApiSafeError('invalid_number', 'Błędny numer.')
      )
    return this.cards.check(cardNumber)
      .then(
        (found) => found.orElseThrow(
          () => new ApiSafeError('invalid_card_number', 'Błędny numer karty.')
        )
      )
      .then(
        (checkedCard) => {
          if (Instant.now().isAtOrAfter(checkedCard.validUntil())) {
            throw new ApiSafeError('outdated_card', 'Karta utraciła ważność.')
          }
          return new ResolvedCard(
            checkedCard.cardNumber(),
            checkedCard.holder().orElseThrow(
              () => new ApiSafeError('not_yet_activated_card', 'Karta musi najpierw zostać aktywowana.')
            )
          )
        }
      )
  }
}

export default CardContextResolver
