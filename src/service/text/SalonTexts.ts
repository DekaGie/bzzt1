import CardNumber from '../domain/CardNumber'

class SalonTexts {
  static onlyCardChecking (salonName: string): string {
    return `Twoje konto jest powiązane z salonem ${salonName}.
Zrób zdjęcie karty Zazero lub podaj mi jej numer.`
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
Zanim ją zaakceptujesz, poproś posiadacza karty o aktywację karty u bota FB.`
  }

  static missingPictureQuestion (): string {
    return 'Nie mamy zdjęcia. Możemy je zrobić?'
  }

  static takePicturePrompt (): string {
    return 'Zrób zdjęcie, pionowo lub poziomo, ale tak by twarz znajdowała się dokładnie na środku kadru.'
  }

  static pictureConsented (yes: boolean): string {
    return yes ? 'Tak :)' : 'Nie teraz...'
  }

  static thanksForCustomerPicture (): string {
    return `Dzięki :)
Wkrótce zaktualizujemy zdjęcie w systemie.`
  }

  static idVerificationPrompt (): string {
    return 'Poproś o dowód osobisty'
  }

  static idVerificationQuestion (fullName: string): string {
    return `Czy to ${fullName}?`
  }

  static pictureVerificationQuestion (): string {
    return 'Czy tożsamość się zgadza?'
  }

  static customerPictureUpdateAborted (): string {
    // eslint-disable-next-line max-len
    return 'Oczekiwałem zdjęcia. Przerywam proces weryfikacji, w razie potrzeby zacznij go od początku, skanując kartę Zazero.'
  }

  static rejectCard (): string {
    return 'Nie akceptuj karty! Operator został powiadomiony o próbie nadużycia karty przez posiadacza.'
  }

  static pickTreatmentPrompt (adding: boolean): string {
    return adding ? 'Jaka jeszcze usługa?' : 'Jaka usługa?'
  }

  static pickTreatmentHint (moreRight: number): string {
    return moreRight === 0 ? 'To wszystkie na tej karcie:' : `Jeszcze ${moreRight} w prawo ->`
  }

  static treatmentPickingContinuation (count: number): string {
    return count === 1 ? 'Ok, tylko ta jedna usługa?'
      : `Ok, ${count} usług, to wszystko?`
  }

  static treatmentPickingContinuationChoice (): string {
    return 'Na jeszcze jakiejś? Przesuń w prawo ->'
  }

  static noTreatmentAvailable (): string {
    return `Ojej :(
Nie oferujecie w swoim salonie żadnych usług dostępnych dla tej karty...
Nie możesz zaakceptować wizyty.`
  }

  static treatmentPickingConfirm (): string {
    return 'Tak, to wszystko.'
  }

  static treatmentPickingCancel (): string {
    return 'Nie, pomyłka, anuluj.'
  }

  static flowCancelled (): string {
    return `Rozumiem.
Przerywam proces rozliczania usług, w razie potrzeby zacznij go od początku, skanując kartę Zazero.`
  }

  static flowSuccessful (customerName: string, treatmentNames: Array<string>): string {
    const listing: string = treatmentNames.map((name) => `\n- ${name}`).join('')
    return `Świetnie!
Zanotowałem: ${customerName}, usługi: ${listing}
Jeśli coś się nie zgadza, wyjaśniaj błąd kontaktując się z operatorem kart Zazero.`
  }

  static unknownCustomer (cardNumber: number): string {
    return `świeża karta ${cardNumber}`
  }
}

export default SalonTexts
