import { Optional } from 'typescript-optional'
import SalonRepository from '../../db/repo/SalonRepository'
import SalonRegistrationRepository
  from '../../db/repo/SalonRegistrationRepository'
import Reactions from '../spi/Reactions'
import SalonRegistrationDbo from '../../db/dbo/SalonRegistrationDbo'
import UnregisteredTexts from '../text/UnregisteredTexts'
import ActorId from '../domain/ActorId'
import Reaction from '../spi/Reaction'
import Results from '../util/Results'

class SalonRegistrator {
  private readonly salonRepository: SalonRepository;

  private readonly salonRegistrationRepository: SalonRegistrationRepository

  constructor (
    salonRepository: SalonRepository,
    salonRegistrationRepository: SalonRegistrationRepository,
  ) {
    this.salonRepository = salonRepository
    this.salonRegistrationRepository = salonRegistrationRepository
  }

  validateAndRegister (
    actorId: ActorId,
    salonSecret: string
  ): Promise<Array<Reaction>> {
    return this.salonRepository.findBySecret(salonSecret)
      .then(Optional.ofNullable)
      .then(
        (salon) => {
          if (!salon.isPresent()) {
            return Results.many(Reactions.plainText(UnregisteredTexts.invalidSalonSecret()))
          }
          const registration: SalonRegistrationDbo = new SalonRegistrationDbo()
          registration.salon = salon.get()
          registration.actorId = actorId.toRepresentation()
          return this.salonRegistrationRepository.save(registration).then(
            () => Results.many(Reactions.plainText(UnregisteredTexts.salonRegistrationSuccess()))
          )
        }
      )
  }

  unregister (actorId: ActorId) {
    return this.salonRegistrationRepository.deleteIfExists(actorId.toRepresentation()).then(
      (success) => Results.many(Reactions.plainText(success ? 'ok' : 'nieaktywny?'))
    )
  }
}

export default SalonRegistrator
