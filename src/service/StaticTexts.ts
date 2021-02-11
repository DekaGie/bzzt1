import { Optional } from 'typescript-optional'

class StaticTexts {
  static salonOnlyChecksCards (): string {
    return `Twoje konto jest powiązane z salonem.
Zrób zdjęcie karty Beauty Zazero lub podaj mi jej numer.`
  }

  static poorBarcodeImage (): string {
    return 'Postaraj się wykonać z bliska zdjęcie kompletnego kodu kreskowego karty.'
  }

  static salonInvalidCardNumber (cardNumber: number): string {
    // eslint-disable-next-line max-len
    return `${cardNumber} nie jest poprawnym numerem karty Beauty Zazero, lub ta karta nie została jeszcze formalnie wydana.
Nie akceptuj jej!`
  }

  static salonOutdatedCard (cardNumber: number): string {
    return `Karta ${cardNumber} jest nieważna.
Nie akceptuj jej!`
  }

  static notYetActivatedCard (cardNumber: number): string {
    return `Karta ${cardNumber} nie została jeszcze aktywowana.
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

  static alreadyActivated (cardNumber: number, employerName: string): string {
    return `Dzięki, ale Twoja karta ${cardNumber} (od ${employerName}) jest już aktywna.
Nie potrzebuję więcej zdjęć :)`
  }

  static activeCustomerWelcome (name: Optional<string>): string {
    return name.map((value) => `Dzień dobry, ${value}!`).orElse('Witaj ponownie!')
  }

  static activeCustomerIntentPrompt (): string {
    return 'W czym mogę pomóc?'
  }

  static signCaption (): string {
    return 'Szukaj tego szyldu!'
  }

  static tutorial (): string {
    return `Najlepiej zapytaj mnie najpierw o aktywne na Twojej karcie usługi.
Następnie spytaj o salony, które akceptują kartę.
Umów się na wizytę w dowolny sposób - nie musisz nawet wspominać o karcie.
Po prostu przy płatności wyciągnij ją zamiast karty płatniczej :)`
  }

  static onlineBooking (): string {
    return 'Rezerwacje online'
  }

  static phoneBooking (): string {
    return 'Zadzwoń do nas'
  }

  static inactiveCustomerWelcome (): string {
    return 'Hej, nieznajoma!'
  }

  static inactiveCustomerIntentPrompt (): string {
    return 'Czym jesteś zainteresowana?'
  }

  static showPartners (): string {
    return 'Salony partnerskie'
  }

  static showSubscriptions (): string {
    return 'Aktywne usługi'
  }

  static customerService (): string {
    return 'Obsługa klienta'
  }

  static activateCard (): string {
    return 'Aktywuj kartę!'
  }

  static yes (): string {
    return 'Tak!'
  }

  static no (): string {
    return 'Nie :('
  }

  static inputCardNumberPrompt (): string {
    return `Dobrze :)
W takim razie zrób zdjęcie swojej karty Beauty Zazero lub podaj mi jej numer.`
  }

  static invalidCardNumber (cardNumber: number): string {
    return `Hmmm, ${cardNumber}?\nTo nie wygląda jak prawidłowy numer karty Beauty Zazero :(`
  }

  static cardActivatedByAnother (cardNumber: number): string {
    return `Niestety, karta ${cardNumber} została już aktywowana przez kogoś innego.`
  }

  static outdatedCard (cardNumber: number): string {
    return `Niestety, karta ${cardNumber} jest nieważna.`
  }

  static showTutorial (): string {
    return 'Jak użyć karty?'
  }

  static unexpectedError (): string {
    return `Przepraszamy, wystąpił niespodziewany błąd po stronie systemu Beauty Zazero.
Jeśli to pilne, skontaktuj się z obsługą klienta: +48 662 097 978`
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

  static ensureActivationPrompt (): string {
    return 'Ooo, to karta Beauty Zazero!'
  }

  static ensureActivationQuestion (): string {
    return 'Chcesz ją aktywować?'
  }

  static acceptCard (): string {
    return 'Akceptuj kartę na usługi: regulacja brwi, henna brwi, laminacja brwi, depilacja wąsika, laminacja rzęs, henna rzęs, przedłużanie rzęs 1:1. Zapisz w versum, że użyta była karta Beauty ZAZERO.'
  }

  static customerPictureUpdateAborted (): string {
    return 'Oczekiwałem zdjęcia klientki. Przerywam proces weryfikacji, w razie potrzeby zacznij go od początku, skanując kartę klientki.'
  }

  static rejectCard (): string {
    return 'Nie akceptuj karty! Operator został powiadomiony o próbie nadużycia ze strony klientki.'
  }
}

export default StaticTexts
