import ActorAssistant from './ActorAssistant'
import SalonRegistrator from './SalonRegistrator'
import CardRegistrationRepository
  from '../../db/repo/CardRegistrationRepository'
import StateStore from '../StateStore'
import FreeTextInquiry from '../spi/FreeTextInquiry'
import Reactions from '../spi/Reactions'
import ActorId from '../domain/ActorId'
import Inquiry from '../spi/Inquiry'
import Reaction from '../spi/Reaction'
import Results from '../util/Results'

class AdminOverrideAssistant implements ActorAssistant<ActorId> {
  private readonly salonRegistrator: SalonRegistrator;

  private readonly cardRegistrationRepository: CardRegistrationRepository;

  private readonly stateStore: StateStore;

  private readonly underlying: ActorAssistant<ActorId>;

  constructor (
    salonRegistrator: SalonRegistrator,
    cardRegistrationRepository: CardRegistrationRepository,
    stateStore: StateStore,
    underlying: ActorAssistant<ActorId>,
  ) {
    this.underlying = underlying
    this.cardRegistrationRepository = cardRegistrationRepository
    this.salonRegistrator = salonRegistrator
    this.stateStore = stateStore
  }

  handle (actorId: ActorId, inquiry: Inquiry): Promise<Array<Reaction>> {
    if (inquiry.type === 'FREE_TEXT') {
      const freeText: FreeTextInquiry = inquiry as FreeTextInquiry
      if (freeText.freeText.startsWith('!')) {
        return this.handleAdminCommand(actorId, freeText.freeText.substring(1))
      }
    }
    return this.underlying.handle(actorId, inquiry)
  }

  private handleAdminCommand (actorId: ActorId, command: string): Promise<Array<Reaction>> {
    const parts: Array<string> = command.split(' ')
      .filter((part) => part.length > 0)
    if (parts.length === 0) {
      return Results.many()
    }
    const verb: string = parts[0]
    if (verb === 'me') {
      return Results.many(Reactions.plainText(`${actorId}: ${JSON.stringify(this.stateStore.allOf(actorId))}`))
    }
    if (verb === 'clearstate') {
      return Results.many(Reactions.plainText('ok'))
    }
    if (verb === 'unactivate') {
      return this.cardRegistrationRepository.deleteIfExists(actorId.toRepresentation()).then(
        (success) => Results.many(Reactions.plainText(success ? 'ok' : 'nieaktywny?'))
      )
    }
    if (verb === 'salon') {
      if (parts.length !== 3) {
        return Results.many(Reactions.plainText('Podaj nazwę salonu i hasło, np. "!salon mkbeauty abc123".'))
      }
      return this.salonRegistrator.validateAndRegister(actorId, parts[1], parts[2])
    }
    if (verb === 'unsalon') {
      return this.salonRegistrator.unregister(actorId)
    }
    return Results.many(Reactions.plainText(`Nie znam komendy ${verb}`))
  }
}

export default AdminOverrideAssistant
