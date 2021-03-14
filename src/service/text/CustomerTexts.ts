import { Optional } from 'typescript-optional'

class CustomerTexts {
  static alreadyActivated (cardNumber: number, employerName: string): string {
    return `Dzięki, ale Twoja karta ${cardNumber} (od ${employerName}) jest już aktywna.
Nie potrzebuję więcej zdjęć :)`
  }

  static welcome (name: Optional<string>): string {
    return name.map((value) => `Dzień dobry, ${value}!`).orElse('Witaj ponownie!')
  }

  static intentPrompt (): string {
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

  static onlineBooking (index: number): string {
    return index === 0 ? 'Rezerwacje online' : '... więcej terminów'
  }

  static phoneBooking (): string {
    return 'Zadzwoń do nas'
  }

  static showPartners (): string {
    return 'Salony partnerskie'
  }

  static showSubscriptions (): string {
    return 'Aktywne usługi'
  }

  static showTutorial (): string {
    return 'Jak użyć karty?'
  }
}

export default CustomerTexts
