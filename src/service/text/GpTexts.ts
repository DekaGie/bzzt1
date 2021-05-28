class GpTexts {
  static poorBarcodeImage (): string {
    return 'Postaraj się wykonać z bliska zdjęcie kompletnego kodu kreskowego karty.'
  }

  static yes (): string {
    return 'Tak!'
  }

  static no (): string {
    return 'Nie :('
  }

  static customerService (): string {
    return 'Obsługa klienta'
  }

  static unexpectedError (): string {
    return `Przepraszamy, wystąpił niespodziewany błąd po stronie systemu Beauty Zazero.
Jeśli to pilne, skontaktuj się z obsługą klienta: +48 662 097 978`
  }

  static missingReaction () {
    return `Przepraszam, ale nie wiem jak zareagować na tę wiadomość.
Być może odpowiedziałaś na pytanie zadane dawno temu?
Spróbuj rozpocząć konwersację od początku :)`
  }
}

export default GpTexts
