/* eslint-disable max-len */
import { Optional } from 'typescript-optional'
import CardActorInfo from '../domain/CardActorInfo'
import Instant from '../domain/Instant'

class CustomerTexts {
  static alreadyActivated (info: CardActorInfo): string {
    return `Dzięki, ale Twoja karta ${info.cardNumber()} (od ${info.employerName()}) jest już aktywna.
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
    return `Najlepiej zapytaj mnie o aktywne na Twojej karcie usługi oraz aktualnie współpracujące salony.
Umów się na wizytę w dowolny sposób - możesz przy rezerwacji wspomnieć, że zamiast płatności skorzystasz z Beauty Zazero.
Więcej szczegółów znajdziesz na https://beautyzazero.pl/faq :)`
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

  static showBarberList (): string {
    return 'Lista barberów'
  }

  static gentlemanKnowledge (info: CardActorInfo, premium: boolean): string {
    return `${info.calloutName().orElse('Hej')},
Twoja karta ${info.cardNumber().asNumber()} (od ${info.employerName()}) jest aktywna w wersji ${premium ? 'Premium' : 'podstawowej (bez Premium)'}.
Całe potrzebne info znajdziesz na https://beautyzazero.pl/gentleman :)
Ja nie będę Ci już do niczego potrzebny.`
  }

  static outdatedCard (info: CardActorInfo, until: Instant): string {
    return `${info.calloutName().orElse('Hej')},
Twoja karta ${info.cardNumber().asNumber()} (od ${info.employerName()}) jest nieaktywna od ${until.toDateString()}'}.
Jeśli chcesz ją ponownie aktywować, skontaktuj się ze swoim pracodawcą :)`
  }
}

export default CustomerTexts
