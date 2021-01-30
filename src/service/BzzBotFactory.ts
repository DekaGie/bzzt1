import ServiceLocator from '../ServiceLocator'
import Config from '../Config'
import BzzBot from './BzzBot'
import BzzCustomerCare from './BzzCustomerCare'
import BarcodeParser from './BarcodeParser'
import Decoder39 from '../code39/Decoder39'
import OcrSpace from '../ocr/OcrSpace'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'

class BzzBotFactory {
  static create (config: Config, locator: ServiceLocator) {
    return new BzzBot(
      new BzzCustomerCare(
        locator.db.refer().getCustomRepository(CardRegistrationRepository),
        new BarcodeParser(new Decoder39(), new OcrSpace(config.ocrSpaceApiKey))
      )
    )
  }
}

export default BzzBotFactory
