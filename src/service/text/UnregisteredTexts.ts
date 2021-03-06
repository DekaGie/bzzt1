import CardNumber from '../domain/CardNumber'

class UnregisteredTexts {
  static welcome (): string {
    return 'Hej, nieznajoma!'
  }

  static intentPrompt (): string {
    return 'Czym jesteś zainteresowana?'
  }

  static activateCard (): string {
    return 'Aktywuj kartę!'
  }

  static inputCardNumberPrompt (): string {
    return `Dobrze :)
W takim razie zrób zdjęcie swojej karty Beauty Zazero lub podaj mi jej numer.`
  }

  static invalidCardNumber (cardNumber: number): string {
    return `Hmmm, ${cardNumber}?\nTo nie wygląda jak prawidłowy numer karty Beauty Zazero :(`
  }

  static cardActivatedByAnother (cardNumber: CardNumber): string {
    return `Niestety, karta ${cardNumber.asNumber()} została już aktywowana przez kogoś innego.`
  }

  static outdatedCard (cardNumber: CardNumber): string {
    return `Niestety, karta ${cardNumber.asNumber()} jest nieważna.`
  }

  static ensureActivationPrompt (): string {
    return 'Ooo, to karta Beauty Zazero!'
  }

  static ensureActivationQuestion (): string {
    return 'Chcesz ją aktywować?'
  }

  static activationSuccess (employerName: string): string {
    return `Karta od ${employerName} aktywowana!`
  }

  static whatNext (): string {
    return 'Pewnie chcesz wiedzieć co dalej?'
  }

  static invalidSalonSecret (): string {
    return 'Nieprawidłowe hasło salonu'
  }

  static salonRegistrationSuccess (): string {
    return 'Twoje konto od teraz powiązane jest z salonem i służy do skanowania kart klientek.'
  }
}

export default UnregisteredTexts
