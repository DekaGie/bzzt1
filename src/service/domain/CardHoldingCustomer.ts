import { Optional } from 'typescript-optional'
import CardRegistrationDbo from '../../db/dbo/CardRegistrationDbo'
import CustomerPersonalData from './CustomerPersonalData'

class CardHoldingCustomer {
  private readonly dbo: CardRegistrationDbo;

  constructor (dbo: CardRegistrationDbo) {
    this.dbo = dbo
  }

  personalData (): Optional<CustomerPersonalData> {
    return Optional.ofNullable(this.dbo.identification)
      .map((identification) => new CustomerPersonalData(identification))
  }
}

export default CardHoldingCustomer
