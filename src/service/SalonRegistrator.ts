import { Optional } from 'typescript-optional'
import SalonRepository from '../db/repo/SalonRepository'
import SalonRegistrationRepository from '../db/repo/SalonRegistrationRepository'
import SalonRegistrationDbo from '../db/dbo/SalonRegistrationDbo'
import CustomerConversator from './CustomerConversator'

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
    conversator: CustomerConversator,
    salonName: string,
    salonSecret: string
  ): void {
    this.salonRepository.createQueryBuilder('salon')
      .where('salon.salonName = :salonName')
      .setParameters({ salonName })
      .getOne()
      .then(Optional.ofNullable)
      .then(
        (salon) => {
          if (!salon.isPresent()) {
            conversator.callback().sendText(`Nie znam salonu "${salonName}".`)
            return
          }
          if (salon.get().salonSecret !== salonSecret) {
            conversator.callback().sendText(
              `Niestety, "${salonSecret}" to nie jest poprawne hasło salonu "${salonName}".`
            )
            return
          }
          const registration: SalonRegistrationDbo = new SalonRegistrationDbo()
          registration.salon = salon.get()
          registration.customerId = conversator.id().toRepresentation()
          this.salonRegistrationRepository.save(registration)
            .then(
              () => {
                conversator.callback().sendText(
                  'Twoje konto od teraz powiązane jest z salonem i służy do skanowania kart klientek.'
                )
              },
              (error) => {
                console.error(`while registering ${salon.get().salonName} to ${conversator.id()}`)
                console.error(error)
                conversator.callback().sendText('Niestety wystąpił błąd. Spróbuj później.')
              }
            )
        }
      )
  }
}

export default SalonRegistrator
