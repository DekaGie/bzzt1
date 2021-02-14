import ServiceLocator from '../ServiceLocator'
import Config from '../Config'
import BzzBot from './BzzBot'
import SalonRepository from '../db/repo/SalonRepository'
import CardRepository from '../db/repo/CardRepository'
import SalonAssistant from './api/SalonAssistant'
import SalonRegistrator from './api/SalonRegistrator'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import SalonRegistrationRepository from '../db/repo/SalonRegistrationRepository'
import CardRegistrator from './api/CardRegistrator'
import BusinessAssistant from './api/BusinessAssistant'
import AdminOverrideAssistant from './api/AdminOverrideAssistant'
import ActorId from './domain/ActorId'
import UnregisteredActorAssistant from './api/UnregisteredActorAssistant'
import ActorAssistant from './api/ActorAssistant'
import CustomerAssistant from './api/CustomerAssistant'
import CardChecker from './api/CardChecker'
import StateStore from './StateStore'
import BarcodeParser from './api/BarcodeParser'
import ActorResolver from './api/ActorResolver'
import TreatmentResolver from './api/TreatmentResolver'
import TreatmentRepository from '../db/repo/TreatmentRepository'

class BzzBotFactory {
  static create (config: Config, locator: ServiceLocator) {
    const cardChecker: CardChecker = new CardChecker(
      locator.db.refer().getCustomRepository(CardRepository)
    )
    const barcodeParser: BarcodeParser = locator.barcodes.refer()
    const stateStore: StateStore = locator.states.refer()
    const cardRegistrationRepository: CardRegistrationRepository = locator.db.refer()
      .getCustomRepository(CardRegistrationRepository)
    const salonRegistrationRepository: SalonRegistrationRepository = locator.db.refer()
      .getCustomRepository(SalonRegistrationRepository)
    const cardRegistrator: CardRegistrator = new CardRegistrator(cardChecker, cardRegistrationRepository)
    const treatmentResolver: TreatmentResolver = new TreatmentResolver(
      locator.db.refer().getCustomRepository(TreatmentRepository)
    )
    const businessAssistant: ActorAssistant<ActorId> = new BusinessAssistant(
      new ActorResolver(salonRegistrationRepository, cardRegistrationRepository),
      new SalonAssistant(barcodeParser, cardChecker, stateStore, treatmentResolver),
      new CustomerAssistant(),
      new UnregisteredActorAssistant(barcodeParser, cardRegistrator, stateStore)
    )
    return new BzzBot(
      new AdminOverrideAssistant(
        new SalonRegistrator(
          locator.db.refer().getCustomRepository(SalonRepository),
          salonRegistrationRepository
        ),
        cardRegistrationRepository,
        stateStore,
        businessAssistant
      )
    )
  }
}

export default BzzBotFactory
