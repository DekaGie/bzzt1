import ImageUrl from './domain/ImageUrl'

interface BzzCustomerAssistant {
  onText (text: string): void;

  onImage (url: ImageUrl): void;
}

export default BzzCustomerAssistant
