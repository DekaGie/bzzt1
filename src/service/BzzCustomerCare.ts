import { Optional } from 'typescript-optional'
import CustomerId from './domain/CustomerId'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import InteractionCallback from './spi/InteractionCallback'
import BarcodeParser from './BarcodeParser'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import BzzInactiveCustomerAssistant from './BzzInactiveCustomerAssistant'
import BzzActiveCustomerAssistant from './BzzActiveCustomerAssistant'
import CardRepository from '../db/repo/CardRepository'
import SalonRepository from '../db/repo/SalonRepository'
import SalonRegistrationRepository
  from '../db/repo/SalonRegistrationRepository'

class BzzCustomerCare {
  private readonly barcodeParser: BarcodeParser

  private readonly cardRepository: CardRepository;

  private readonly cardRegistrationRepository: CardRegistrationRepository;

  private readonly salonRepository: SalonRepository;

  private readonly salonRegistrationRepository: SalonRegistrationRepository

  constructor (
    cardRepository: CardRepository,
    cardRegistrationRepository: CardRegistrationRepository,
    salonRepository: SalonRepository,
    salonRegistrationRepository: SalonRegistrationRepository,
    barcodeParser: BarcodeParser
  ) {
    this.cardRepository = cardRepository
    this.cardRegistrationRepository = cardRegistrationRepository
    this.salonRepository = salonRepository
    this.salonRegistrationRepository = salonRegistrationRepository
    this.barcodeParser = barcodeParser
  }

  assistantFor (
    cid: CustomerId, callback: InteractionCallback
  ): Promise<BzzCustomerAssistant> {
    return this.cardRegistrationRepository.findFull(cid.toRepresentation())
      .then(Optional.ofNullable)
      .then(
        (registration) => {
          if (registration.isPresent()) {
            return new BzzActiveCustomerAssistant(registration.get(), callback)
          }
          return new BzzInactiveCustomerAssistant(
            cid,
            this.cardRepository,
            this.cardRegistrationRepository,
            this.salonRepository,
            this.salonRegistrationRepository,
            this.barcodeParser,
            callback
          )
        }
      )
  }
}

export default BzzCustomerCare
