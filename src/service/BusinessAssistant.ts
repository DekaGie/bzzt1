import { Optional } from 'typescript-optional'
import ActorAssistant from './ActorAssistant'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import UnregisteredActorAssistant from './UnregisteredActorAssistant'
import CustomerAssistant from './CustomerAssistant'
import SalonRegistrationRepository from '../db/repo/SalonRegistrationRepository'
import SalonAssistant from './SalonAssistant'
import Reaction from './spi/Reaction'
import Inquiry from './spi/Inquiry'
import ActorId from './domain/ActorId'

class BusinessAssistant implements ActorAssistant<ActorId> {
  private readonly salonAssistant: SalonAssistant;

  private readonly cardRegistrationRepository: CardRegistrationRepository;

  private readonly salonRegistrationRepository: SalonRegistrationRepository;

  private readonly customerAssistant: CustomerAssistant;

  private readonly unregisteredActorAssistant: UnregisteredActorAssistant;

  constructor (
    salonRegistrationRepository: SalonRegistrationRepository,
    cardRegistrationRepository: CardRegistrationRepository,
    salonAssistant: SalonAssistant,
    customerAssistant: CustomerAssistant,
    unregisteredActorAssistant: UnregisteredActorAssistant
  ) {
    this.salonRegistrationRepository = salonRegistrationRepository
    this.cardRegistrationRepository = cardRegistrationRepository
    this.salonAssistant = salonAssistant
    this.customerAssistant = customerAssistant
    this.unregisteredActorAssistant = unregisteredActorAssistant
  }

  handle (actorId: ActorId, inquiry: Inquiry): Promise<Array<Reaction>> {
    return this.salonRegistrationRepository.findFull(actorId.toRepresentation())
      .then(Optional.ofNullable)
      .then(
        (optionalSalonRegistration) => {
          if (optionalSalonRegistration.isPresent()) {
            return this.salonAssistant.handle(optionalSalonRegistration.get(), inquiry)
          }
          return this.cardRegistrationRepository.findFull(actorId.toRepresentation())
            .then(Optional.ofNullable)
            .then(
              (optionalCardRegistration) => {
                if (optionalCardRegistration.isPresent()) {
                  return this.customerAssistant.handle(optionalCardRegistration.get(), inquiry)
                }
                return this.unregisteredActorAssistant.handle(actorId, inquiry)
              }
            )
        }
      )
  }
}

export default BusinessAssistant
