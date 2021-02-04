import SalonRegistrator from './SalonRegistrator'
import CustomerConversator from './CustomerConversator'

class BangAssistantDelegate {
  private readonly conversator: CustomerConversator;

  private readonly salonRegistrator: SalonRegistrator;

  constructor (
    conversator: CustomerConversator,
    salonRegistrator: SalonRegistrator,
  ) {
    this.conversator = conversator
    this.salonRegistrator = salonRegistrator
  }

  onBang (content: string): void {
    const parts: Array<string> = content.split(' ')
      .filter((part) => part.length > 0)
    if (parts.length === 0) {
      return
    }
    const verb: string = parts[0]
    if (verb === 'me') {
      this.conversator.callback().sendText(this.conversator.id().toString())
      return
    }
    if (verb === 'salon') {
      if (parts.length !== 3) {
        this.conversator.callback().sendText('Podaj nazwę salonu i hasło, np. "!salon powerbrows abc123".')
        return
      }
      this.salonRegistrator.validateAndRegister(this.conversator, parts[1], parts[2])
    }
  }
}

export default BangAssistantDelegate
