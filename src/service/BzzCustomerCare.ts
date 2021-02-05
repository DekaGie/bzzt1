import { Optional } from 'typescript-optional'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import BarcodeParser from './BarcodeParser'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import BzzInactiveCustomerAssistant from './BzzInactiveCustomerAssistant'
import BzzActiveCustomerAssistant from './BzzActiveCustomerAssistant'
import CardRepository from '../db/repo/CardRepository'
import SalonRepository from '../db/repo/SalonRepository'
import SalonRegistrationRepository from '../db/repo/SalonRegistrationRepository'
import BangAssistantDelegate from './BangAssistantDelegate'
import CardRegistrator from './CardRegistrator'
import SalonRegistrator from './SalonRegistrator'
import CustomerConversator from './CustomerConversator'
import BzzSalonCustomerAssistant from './BzzSalonCustomerAssistant'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'

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

  assistantFor (conversator: CustomerConversator): Promise<BzzCustomerAssistant> {
    return this.salonRegistrationRepository.findFull(conversator.id().toRepresentation())
      .then(Optional.ofNullable)
      .then(
        (optionalSalonRegistration) => optionalSalonRegistration.map(
          (salonRegistration) => this.salonAssistantFor(conversator)
        ).orElseGet(
          () => this.publicAssistantFor(conversator)
        )
      )
  }

  private salonAssistantFor (conversator: CustomerConversator): Promise<BzzCustomerAssistant> {
    return Promise.resolve(
      new BzzSalonCustomerAssistant(conversator, this.barcodeParser, this.cardRepository)
    )
  }

  private publicAssistantFor (conversator: CustomerConversator): Promise<BzzCustomerAssistant> {
    return this.cardRegistrationRepository.findFull(conversator.id().toRepresentation())
      .then(Optional.ofNullable)
      .then(
        (optionalCardRegistration) => optionalCardRegistration.map(
          (cardRegistration) => this.activeAssistantFor(conversator, cardRegistration)
        ).orElseGet(
          () => this.inactiveAssistantFor(conversator)
        )
      )
  }

  private activeAssistantFor (
    conversator: CustomerConversator, registration: CardRegistrationDbo
  ): Promise<BzzCustomerAssistant> {
    return Promise.resolve(new BzzActiveCustomerAssistant(conversator, registration))
  }

  private inactiveAssistantFor (conversator: CustomerConversator): Promise<BzzCustomerAssistant> {
    return Promise.resolve(
      new BzzInactiveCustomerAssistant(
        conversator,
        new BangAssistantDelegate(
          conversator,
          new SalonRegistrator(
            this.salonRepository, this.salonRegistrationRepository
          )
        ),
        this.barcodeParser,
        new CardRegistrator(
          this.cardRepository, this.cardRegistrationRepository
        )
      )
    )
  }
}

export default BzzCustomerCare
