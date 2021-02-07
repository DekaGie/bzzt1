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
Po prostu przy płatności wyciągnij ją zamiast karty płatniczej :)'`
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
}

export default StaticTexts
