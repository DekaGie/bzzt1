import CardNumber from '../../service/domain/CardNumber'
import CardHoldingCustomer from '../../service/domain/CardHoldingCustomer'

class ResolvedCard {
  private readonly number: CardNumber;

  private readonly holdingCustomer: CardHoldingCustomer;

  constructor (number: CardNumber, holdingCustomer: CardHoldingCustomer) {
    this.number = number
    this.holdingCustomer = holdingCustomer
  }

  cardNumber (): CardNumber {
    return this.number
  }

  holder (): CardHoldingCustomer {
    return this.holdingCustomer
  }
}

export default ResolvedCard
