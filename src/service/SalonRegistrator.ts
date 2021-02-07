import { Optional } from 'typescript-optional'
import SalonRepository from '../db/repo/SalonRepository'
import SalonRegistrationRepository from '../db/repo/SalonRegistrationRepository'
import SalonRegistrationDbo from '../db/dbo/SalonRegistrationDbo'
import CustomerId from './domain/CustomerId'
import Reaction from './spi/Reaction'
import Reactions from './spi/Reactions'
import Results from './Results'

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
    customerId: CustomerId,
    salonName: string,
    salonSecret: string
  ): Promise<Array<Reaction>> {
    return this.salonRepository.createQueryBuilder('salon')
      .where('salon.salonName = :salonName')
      .setParameters({ salonName })
      .getOne()
      .then(Optional.ofNullable)
      .then(
        (salon) => {
          if (!salon.isPresent()) {
            return Results.many(Reactions.plainText(`Nie znam salonu "${salonName}".`))
          }
          if (salon.get().salonSecret !== salonSecret) {
            return Results.many(Reactions.plainText(`Niestety, salon "${salonName}" ma hasło inne niż "${salonSecret}".`))
          }
          const registration: SalonRegistrationDbo = new SalonRegistrationDbo()
          registration.salon = salon.get()
          registration.customerId = customerId.toRepresentation()
          return this.salonRegistrationRepository.save(registration).then(
            () => Results.many(Reactions.plainText('Twoje konto od teraz powiązane jest z salonem i służy do skanowania kart klientek.'))
          )
        }
      )
  }

  unregister (customerId: CustomerId) {
    return this.salonRegistrationRepository.deleteIfExists(customerId.toRepresentation()).then(
      (success) => Results.many(Reactions.plainText(success ? 'ok' : 'nieaktywny?'))
    )
  }
}

export default SalonRegistrator
