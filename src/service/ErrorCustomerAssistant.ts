import ImageUrl from './domain/ImageUrl'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import CustomerConversator from './CustomerConversator'

class ErrorCustomerAssistant implements BzzCustomerAssistant {
  private readonly conversator: CustomerConversator;

  constructor (conversator: CustomerConversator) {
    this.conversator = conversator
  }

  onText (text: string): void {
    this.onError()
  }

  onImage (url: ImageUrl): void {
    this.onError()
  }

  onCommand (command: any): void {
    this.onError()
  }

  private onError () {
    this.conversator.callback().sendText(
      'Przepraszam, ale wystąpił błąd po stronie systemu Beauty Zazero.\n'
        + 'Skontaktuje się z Tobą nasz przedstawiciel.'
    )
  }
}

export default ErrorCustomerAssistant
