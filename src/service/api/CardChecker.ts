import { Optional } from 'typescript-optional'
import CardRepository from '../../db/repo/CardRepository'
import CheckedCard from '../domain/CheckedCard'
import CardNumber from '../domain/CardNumber'

class CardChecker {
  private static readonly NUMBER_LENGTH: number = 9

  private readonly cardRepository: CardRepository;

  constructor (cardRepository: CardRepository) {
    this.cardRepository = cardRepository
  }

  check (cardNumber: number): Promise<Optional<CheckedCard>> {
    if (cardNumber.toString().length !== CardChecker.NUMBER_LENGTH) {
      return Promise.resolve(Optional.empty())
    }
    return this.cardRepository.findFull(cardNumber)
      .then(Optional.ofNullable)
      .then((optionalCard) => optionalCard.map((card) => new CheckedCard(card)))
  }

  get (cardNumber: CardNumber): Promise<CheckedCard> {
    return this.check(cardNumber.asNumber())
      .then((optionalCard) => optionalCard.get())
  }
}

export default CardChecker
