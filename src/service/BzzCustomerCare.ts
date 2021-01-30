import { Equal } from 'typeorm'
import { Optional } from 'typescript-optional'
import CustomerId from './domain/CustomerId'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import InteractionCallback from './spi/InteractionCallback'
import BarcodeParser from './BarcodeParser'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import BzzInactiveCustomerAssistant from './BzzInactiveCustomerAssistant'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import BzzActiveCustomerAssistant from './BzzActiveCustomerAssistant'

class BzzCustomerCare {
  private readonly barcodeParser: BarcodeParser

  private readonly registrationRepository: CardRegistrationRepository;

  constructor (
    registrationRepository: CardRegistrationRepository,
    barcodeParser: BarcodeParser
  ) {
    this.registrationRepository = registrationRepository
    this.barcodeParser = barcodeParser
  }

  assistantFor (
    cid: CustomerId, callback: InteractionCallback
  ): Promise<BzzCustomerAssistant> {
    return this.findRegistration(cid)
      .then(
        (registration) => registration
          .map<BzzCustomerAssistant>(
            (registration) => new BzzActiveCustomerAssistant(
              registration, callback
            )
          )
          .orElseGet(
            () => new BzzInactiveCustomerAssistant(
              this.registrationRepository,
              this.barcodeParser,
              cid,
              callback
            )
          )
      )
  }

  private findRegistration (cid: CustomerId): Promise<Optional<CardRegistrationDbo>> {
    return this.registrationRepository
      .findOne(
        {
          customerId: Equal(cid.toRepresentation())
        },
        {
          join: CardRegistrationDbo.WITH_CARD
        }
      )
      .then(Optional.ofNullable)
  }
}

export default BzzCustomerCare
