import ServiceLocator from '../ServiceLocator'
import Config from '../Config'
import BzzBot from './BzzBot'
import BusinessAssistant from './BusinessAssistant'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import CardRepository from '../db/repo/CardRepository'
import SalonRegistrationRepository from '../db/repo/SalonRegistrationRepository'
import SalonCustomerAssistant from './SalonCustomerAssistant'
import InactiveCustomerAssistant from './InactiveCustomerAssistant'
import ActiveCustomerAssistant from './ActiveCustomerAssistant'
import CardRegistrator from './CardRegistrator'
import CustomerAssistant from './CustomerAssistant'
import CustomerId from './domain/CustomerId'
import AdminOverrideAssistant from './AdminOverrideAssistant'
import SalonRegistrator from './SalonRegistrator'
import SalonRepository from '../db/repo/SalonRepository'

class BzzBotFactory {
  static create (config: Config, locator: ServiceLocator) {
    const businessAssistant: CustomerAssistant<CustomerId> = new BusinessAssistant(
      locator.db.refer().getCustomRepository(SalonRegistrationRepository),
      locator.db.refer().getCustomRepository(CardRegistrationRepository),
      new SalonCustomerAssistant(
        locator.barcodes.refer(),
        locator.db.refer().getCustomRepository(CardRepository)
      ),
      new ActiveCustomerAssistant(),
      new InactiveCustomerAssistant(
        locator.barcodes.refer(),
        new CardRegistrator(
          locator.db.refer().getCustomRepository(CardRepository),
          locator.db.refer().getCustomRepository(CardRegistrationRepository)
        ),
        locator.states.refer()
      )
    )
    return new BzzBot(
      new AdminOverrideAssistant(
        new SalonRegistrator(
          locator.db.refer().getCustomRepository(SalonRepository),
          locator.db.refer().getCustomRepository(SalonRegistrationRepository)
        ),
        locator.states.refer(),
        businessAssistant
      )
    )
  }
}

export default BzzBotFactory
