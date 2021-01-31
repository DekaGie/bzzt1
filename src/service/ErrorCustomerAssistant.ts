import InteractionCallback from './spi/InteractionCallback'
import ImageUrl from './domain/ImageUrl'
import BzzCustomerAssistant from './BzzCustomerAssistant'

class ErrorCustomerAssistant implements BzzCustomerAssistant {
  private readonly callback: InteractionCallback;

  constructor (callback: InteractionCallback) {
    this.callback = callback
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
    this.callback.sendText('Przepraszam, ale wystąpił błąd po stronie systemu Beauty Zazero.\n'
        + 'Skontaktuje się z Tobą nasz przedstawiciel.')
  }
}

export default ErrorCustomerAssistant
