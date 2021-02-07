import { Optional } from 'typescript-optional'
import CustomerAssistant from './CustomerAssistant'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import InactiveCustomerAssistant from './InactiveCustomerAssistant'
import ActiveCustomerAssistant from './ActiveCustomerAssistant'
import SalonRegistrationRepository from '../db/repo/SalonRegistrationRepository'
import SalonCustomerAssistant from './SalonCustomerAssistant'
import Reaction from './spi/Reaction'
import Inquiry from './spi/Inquiry'
import CustomerId from './domain/CustomerId'

class BusinessAssistant implements CustomerAssistant<CustomerId> {
  private readonly salonAssistant: SalonCustomerAssistant;

  private readonly cardRegistrationRepository: CardRegistrationRepository;

  private readonly salonRegistrationRepository: SalonRegistrationRepository;

  private readonly activeAssistant: ActiveCustomerAssistant;

  private readonly inactiveAssistant: InactiveCustomerAssistant;

  constructor (
    salonRegistrationRepository: SalonRegistrationRepository,
    cardRegistrationRepository: CardRegistrationRepository,
    salonAssistant: SalonCustomerAssistant,
    activeAssistant: ActiveCustomerAssistant,
    inactiveAssistant: InactiveCustomerAssistant
  ) {
    this.salonRegistrationRepository = salonRegistrationRepository
    this.cardRegistrationRepository = cardRegistrationRepository
    this.salonAssistant = salonAssistant
    this.activeAssistant = activeAssistant
    this.inactiveAssistant = inactiveAssistant
  }

  handle (customerId: CustomerId, inquiry: Inquiry): Promise<Array<Reaction>> {
    return this.salonRegistrationRepository.findFull(customerId.toRepresentation())
      .then(Optional.ofNullable)
      .then(
        (optionalSalonRegistration) => {
          if (optionalSalonRegistration.isPresent()) {
            return this.salonAssistant.handle(optionalSalonRegistration.get(), inquiry)
          }
          return this.cardRegistrationRepository.findFull(customerId.toRepresentation())
            .then(Optional.ofNullable)
            .then(
              (optionalCardRegistration) => {
                if (optionalCardRegistration.isPresent()) {
                  return this.activeAssistant.handle(optionalCardRegistration.get(), inquiry)
                }
                return this.inactiveAssistant.handle(customerId, inquiry)
              }
            )
        }
      )
  }
}

export default BusinessAssistant
