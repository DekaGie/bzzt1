class CardChecker {
  check (cardNumber: number): string {
    if (cardNumber === 113192399) {
      return 'Dziękuję!\nTwoja karta jest ważna do 17.02.2021 i obejmuje usługi:\n'
          + ' - Stylizacja Brwi'
    }
    if (cardNumber === 113329308) {
      return 'Dziękuję!\nTwoja karta jest ważna do 31.12.2021 i obejmuje usługi:\n'
          + ' - Paznokcie\n'
          + ' - Stylizacja Rzęs'
    }
    if (cardNumber === 114945246) {
      return 'Niestety, Twoja karta straciła ważność 30.11.2020.'
    }
    if (cardNumber === 114990607) {
      return 'Niestety, Twoja karta straciła ważność 31.08.2020.'
    }
    if (cardNumber === 138482385) {
      return 'Dziękuję!\nTwoja karta jest ważna do 28.06.2021 i obejmuje usługi:\n'
          + ' - Stylizacja Brwi\n'
          + ' - Stylizacja Rzęs'
    }
    return 'Niestety, nie rozpoznałem numeru karty. '
          + 'Wykonaj czytelne zdjęcie kodu na odwrocie karty, '
          + 'lub przepisz wszystkie cyfry znajdujące się pod kodem kreskowym.'
  }
}

export default CardChecker
