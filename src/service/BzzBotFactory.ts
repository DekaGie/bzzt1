import ServiceLocator from '../ServiceLocator'
import Config from '../Config'
import BzzBot from './BzzBot'
import BzzCustomerCare from './BzzCustomerCare'
import BarcodeParser from './BarcodeParser'
import Decoder39 from '../code39/Decoder39'
import OcrSpace from '../ocr/OcrSpace'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import FbProfileFetcher from '../fb/FbProfileFetcher'
import CardRepository from '../db/repo/CardRepository'

class BzzBotFactory {
  static create (config: Config, locator: ServiceLocator) {
    return new BzzBot(
      new BzzCustomerCare(
        new FbProfileFetcher(locator.fbClient.refer()),
        locator.db.refer().getCustomRepository(CardRegistrationRepository),
        locator.db.refer().getCustomRepository(CardRepository),
        new BarcodeParser(new Decoder39(), new OcrSpace(config.ocrSpaceApiKey))
      )
    )
  }
}

export default BzzBotFactory
