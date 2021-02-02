import ServiceLocator from '../ServiceLocator'
import Config from '../Config'
import BzzBot from './BzzBot'
import BzzCustomerCare from './BzzCustomerCare'
import BarcodeParser from './BarcodeParser'
import Decoder39 from '../code39/Decoder39'
import OcrSpace from '../ocr/OcrSpace'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import CardRepository from '../db/repo/CardRepository'
import SalonRepository from '../db/repo/SalonRepository'
import SalonRegistrationRepository
  from '../db/repo/SalonRegistrationRepository'

class BzzBotFactory {
  static create (config: Config, locator: ServiceLocator) {
    return new BzzBot(
      new BzzCustomerCare(
        locator.db.refer().getCustomRepository(CardRepository),
        locator.db.refer().getCustomRepository(CardRegistrationRepository),
        locator.db.refer().getCustomRepository(SalonRepository),
        locator.db.refer().getCustomRepository(SalonRegistrationRepository),
        new BarcodeParser(new Decoder39(), new OcrSpace(config.ocrSpaceApiKey))
      )
    )
  }
}

export default BzzBotFactory
