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
import CardUpdater from './api/CardUpdater'
import IdentificationRepository from '../db/repo/IdentificationRepository'
import SalonResolver from './api/SalonResolver'
import PacketResolver from './api/PacketResolver'
import PacketRepository from '../db/repo/PacketRepository'

class BzzBotFactory {
  static create (config: Config, locator: ServiceLocator) {
    const cardChecker: CardChecker = new CardChecker(
      locator.db.refer().getCustomRepository(CardRepository)
    )
    const cardUpdater: CardUpdater = new CardUpdater(
      locator.db.refer().getCustomRepository(IdentificationRepository)
    )
    const barcodeParser: BarcodeParser = locator.barcodes.refer()
    const stateStore: StateStore = locator.states.refer()
    const cardRegistrationRepository: CardRegistrationRepository = locator.db.refer()
      .getCustomRepository(CardRegistrationRepository)
    const salonRegistrationRepository: SalonRegistrationRepository = locator.db.refer()
      .getCustomRepository(SalonRegistrationRepository)
    const salonRepository: SalonRepository = locator.db.refer()
      .getCustomRepository(SalonRepository)
    const packetRepository: PacketRepository = locator.db.refer()
      .getCustomRepository(PacketRepository)
    const cardRegistrator: CardRegistrator = new CardRegistrator(cardChecker, cardRegistrationRepository)
    const treatmentResolver: TreatmentResolver = new TreatmentResolver(
      locator.db.refer().getCustomRepository(TreatmentRepository)
    )
    const salonResolver: SalonResolver = new SalonResolver(salonRepository)
    const packetResolver: PacketResolver = new PacketResolver(packetRepository)
    const businessAssistant: ActorAssistant<ActorId> = new BusinessAssistant(
      new ActorResolver(salonRegistrationRepository, cardRegistrationRepository),
      new SalonAssistant(barcodeParser, cardChecker, cardUpdater, stateStore, treatmentResolver),
      new CustomerAssistant(salonResolver, packetResolver),
      new UnregisteredActorAssistant(barcodeParser, cardRegistrator, stateStore)
    )
    return new BzzBot(
      new AdminOverrideAssistant(
        new SalonRegistrator(salonRepository, salonRegistrationRepository),
        cardRegistrationRepository,
        stateStore,
        businessAssistant
      )
    )
  }
}

export default BzzBotFactory
