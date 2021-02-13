import AnyId from './AnyId'
import Converter from '../../util/Converter'
import Converters from '../../util/Converters'

class CardNumber extends AnyId {
  public static readonly NUMBER_CONVERTER: Converter<CardNumber, number> = Converters.construct(
    (cardNumber) => cardNumber.asNumber(), (cardNumber) => new CardNumber(cardNumber)
  )

  private readonly numeric: number;

  constructor (numeric: number) {
    super(numeric.toString())
    this.numeric = numeric
  }

  asNumber (): number {
    return this.numeric
  }

  typeName (): string {
    return CardNumber.name
  }
}

export default CardNumber
