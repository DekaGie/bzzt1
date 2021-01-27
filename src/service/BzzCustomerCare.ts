import CustomerId from './domain/CustomerId'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import InteractionCallback from './spi/InteractionCallback'
import BarcodeParser from './BarcodeParser'

class BzzCustomerCare {
  private readonly barcodeParser: BarcodeParser

  constructor (barcodeParser: BarcodeParser) {
    this.barcodeParser = barcodeParser
  }

  assistantFor (cid: CustomerId, callback: InteractionCallback): BzzCustomerAssistant {
    return new BzzCustomerAssistant(this.barcodeParser, cid, callback)
  }
}

export default BzzCustomerCare
