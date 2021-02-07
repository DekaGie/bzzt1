import { Optional } from 'typescript-optional'
import ActiveCustomerIntent from './ActiveCustomerIntent'

class TextExtractions {
  static cardNumber (text: string): Optional<number> {
    return Optional.of(
      Array.from(text)
        .filter((char) => char >= '0' && char <= '9')
        .reduce((left, right) => left + right, '')
    )
      .filter((string) => string.length > 6)
      .map((string) => Number.parseInt(string, 10))
      .filter((integer) => !Number.isNaN(integer))
  }

  static activeCustomerIntent (text: string): Optional<ActiveCustomerIntent> {
    const lowercased: string = text.toLowerCase()
    if (lowercased.includes('salon') || lowercased.includes('partner')) {
      return Optional.of(ActiveCustomerIntent.SHOW_PARTNERS)
    }
    if (lowercased.includes('usług') || lowercased.includes('uslug') || lowercased.includes('pakiet')) {
      return Optional.of(ActiveCustomerIntent.SHOW_SUBSCRIPTIONS)
    }
    if (lowercased.includes('jak') || lowercased.includes('czy')) {
      return Optional.of(ActiveCustomerIntent.SHOW_TUTORIAL)
    }
    return Optional.empty()
  }
}

export default TextExtractions
