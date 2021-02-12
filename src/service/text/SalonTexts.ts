import CardNumber from '../domain/CardNumber'

class SalonTexts {
  static onlyCardChecking (): string {
    return `Twoje konto jest powiązane z salonem.
Zrób zdjęcie karty Beauty Zazero lub podaj mi jej numer.`
  }

  static invalidCardNumber (cardNumber: number): string {
    // eslint-disable-next-line max-len
    return `${cardNumber} nie jest poprawnym numerem karty Beauty Zazero, lub ta karta nie została jeszcze formalnie wydana.
Nie akceptuj jej!`
  }

  static outdatedCard (cardNumber: CardNumber): string {
    return `Karta ${cardNumber.asNumber()} jest nieważna.
Nie akceptuj jej!`
  }

  static notYetActivatedCard (cardNumber: CardNumber): string {
    return `Karta ${cardNumber.asNumber()} nie została jeszcze aktywowana.
Zanim ją zaakceptujesz, poproś by klientka zagadała do bota i aktywowała kartę.`
  }

  static missingPictureQuestion (): string {
    return 'Nie mamy zdjęcia. Możemy je zrobić?'
  }

  static takePicturePrompt (): string {
    return 'Zrób zdjęcie, pionowo lub poziomo, ale tak by twarz klientki znajdowała się dokładnie na środku kadru.'
  }

  static pictureConsented (yes: boolean): string {
    return yes ? 'Klientka pozwala :)' : 'Nie teraz...'
  }

  static thanksForCustomerPicture (): string {
    return `Dzięki :)
Wkrótce zaktualizujemy zdjęcie klientki w systemie.`
  }

  static idVerificationPrompt (): string {
    return 'Poproś o dowód osobisty'
  }

  static idVerificationQuestion (fullName: string): string {
    return `Czy to ${fullName}?`
  }

  static pictureVerificationQuestion (): string {
    return 'Czy to ta klientka?'
  }

  static acceptCard (): string {
    // eslint-disable-next-line max-len
    return 'Akceptuj kartę na usługi: regulacja brwi, henna brwi, laminacja brwi, depilacja wąsika, laminacja rzęs, henna rzęs, przedłużanie rzęs 1:1. Zapisz w versum, że użyta była karta Beauty ZAZERO.'
  }

  static customerPictureUpdateAborted (): string {
    // eslint-disable-next-line max-len
    return 'Oczekiwałem zdjęcia klientki. Przerywam proces weryfikacji, w razie potrzeby zacznij go od początku, skanując kartę klientki.'
  }

  static rejectCard (): string {
    return 'Nie akceptuj karty! Operator został powiadomiony o próbie nadużycia ze strony klientki.'
  }
}

export default SalonTexts
