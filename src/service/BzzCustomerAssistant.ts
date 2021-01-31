import ImageUrl from './domain/ImageUrl'

interface BzzCustomerAssistant {
  onText (text: string): void;

  onImage (url: ImageUrl): void;

  onCommand (command: any): void;
}

export default BzzCustomerAssistant
