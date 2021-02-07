import CustomerAssistant from './CustomerAssistant'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import Reaction from './spi/Reaction'
import Inquiry from './spi/Inquiry'
import CustomerId from './domain/CustomerId'
import SalonRegistrator from './SalonRegistrator'
import StateStore from './StateStore'
import FreeTextInquiry from './spi/FreeTextInquiry'
import Results from './Results'
import Reactions from './spi/Reactions'

class AdminOverrideAssistant implements CustomerAssistant<CustomerId> {
  private readonly salonRegistrator: SalonRegistrator;

  private readonly cardRegistrationRepository: CardRegistrationRepository;

  private readonly stateStore: StateStore;

  private readonly underlying: CustomerAssistant<CustomerId>;

  constructor (
    salonRegistrator: SalonRegistrator,
    cardRegistrationRepository: CardRegistrationRepository,
    stateStore: StateStore,
    underlying: CustomerAssistant<CustomerId>,
  ) {
    this.underlying = underlying
    this.salonRegistrator = salonRegistrator
    this.stateStore = stateStore
  }

  handle (customerId: CustomerId, inquiry: Inquiry): Promise<Array<Reaction>> {
    if (inquiry.type === 'FREE_TEXT') {
      const freeText: FreeTextInquiry = inquiry as FreeTextInquiry
      if (freeText.freeText.startsWith('!')) {
        return this.handleAdminCommand(customerId, freeText.freeText.substring(1))
      }
    }
    return this.underlying.handle(customerId, inquiry)
  }

  private handleAdminCommand (customerId: CustomerId, command: string): Promise<Array<Reaction>> {
    const parts: Array<string> = command.split(' ')
      .filter((part) => part.length > 0)
    if (parts.length === 0) {
      return Results.many()
    }
    const verb: string = parts[0]
    if (verb === 'me') {
      return Results.many(Reactions.plainText(`${customerId}: ${JSON.stringify(this.stateStore.allOf(customerId))}`))
    }
    if (verb === 'clearstate') {
      return Results.many(Reactions.plainText('ok'))
    }
    if (verb === 'unactivate') {
      return this.cardRegistrationRepository.deleteIfExists(customerId.toRepresentation()).then(
        (success) => Results.many(Reactions.plainText(success ? 'ok' : 'nieaktywny?'))
      )
    }
    if (verb === 'salon') {
      if (parts.length !== 3) {
        return Results.many(Reactions.plainText('Podaj nazwę salonu i hasło, np. "!salon mkbeauty abc123".'))
      }
      return this.salonRegistrator.validateAndRegister(customerId, parts[1], parts[2])
    }
    if (verb === 'unsalon') {
      return this.salonRegistrator.unregister(customerId)
    }
    return Results.many(Reactions.plainText(`Nie znam komendy ${verb}`))
  }
}

export default AdminOverrideAssistant
