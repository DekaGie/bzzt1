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

  static customerPictureUpdateAborted (): string {
    // eslint-disable-next-line max-len
    return 'Oczekiwałem zdjęcia klientki. Przerywam proces weryfikacji, w razie potrzeby zacznij go od początku, skanując kartę klientki.'
  }

  static rejectCard (): string {
    return 'Nie akceptuj karty! Operator został powiadomiony o próbie nadużycia ze strony klientki.'
  }

  static pickTreatmentPrompt (adding: boolean): string {
    return adding ? 'Jaka jeszcze usługa?' : 'Na jaką przyszła usługę?'
  }

  static pickTreatmentHint (moreRight: number): string {
    return moreRight === 0 ? 'To wszystkie w jej pakiecie:' : `Jeszcze ${moreRight} w prawo ->`
  }

  static treatmentPickingContinuation (count: number): string {
    return count === 1 ? 'Ok, była na tej jednej usłudze?'
      : `Ok, była na tych ${count} usługach?`
  }

  static treatmentPickingContinuationChoice (): string {
    return 'Na jeszcze jakiejś? Przesuń w prawo ->'
  }

  static noTreatmentAvailable (): string {
    return `Ojej :(
Nie oferujecie w swoim salonie żadnych usług dostępnych w pakiecie tej klientki...
Nie możesz zaakceptować tej karty.`
  }

  static treatmentPickingConfirm (): string {
    return 'Tak, to wszystko.'
  }

  static treatmentPickingCancel (): string {
    return 'Nie, pomyłka, anuluj.'
  }

  static flowCancelled (): string {
    return `Rozumiem.
Przerywam proces rozliczania usług, w razie potrzeby zacznij go od początku, skanując kartę klientki.`
  }

  static flowSuccessful (customerName: string, treatmentNames: Array<string>): string {
    const listing: string = treatmentNames.map((name) => `\n- ${name}`).join('')
    return `Świetnie!
Zanotowałem, że ${customerName} przyszła do Was na usługi: ${listing}
Jeśli coś się nie zgadza, wyjaśniaj błąd kontaktując się z operatorem Beauty Zazero.`
  }
}

export default SalonTexts
