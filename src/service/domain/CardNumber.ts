import AnyId from './AnyId'

class CardNumber extends AnyId {
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
