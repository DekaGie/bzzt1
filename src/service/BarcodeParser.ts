import { Optional } from 'typescript-optional'
import OcrSpace from '../ocr/OcrSpace'

class BarcodeParser {
  private readonly ocrSpace: OcrSpace;

  private readonly digitCount: number;

  constructor (ocrSpace: OcrSpace, digitCount: number = 9) {
    this.ocrSpace = ocrSpace
    this.digitCount = digitCount
  }

  parse (imageUrl: string): Promise<Optional<number>> {
    return this.ocrSpace.recognize(imageUrl).then(
      (texts) => this.findNumber(texts),
      (err) => {
        console.log(`when parsing barcode on ${imageUrl}:`)
        console.log(err)
        return Optional.empty()
      }
    )
  }

  private findNumber (texts: Array<string>): Optional<number> {
    const numbers: Array<number> = texts
      .reduce((left, right) => `${left} ${right}`, '')
      .split(/(\s+)/)
      .filter((word) => word.length === this.digitCount)
      .map((word) => Number.parseInt(word, 10))
      .filter((cardNumber) => !Number.isNaN(cardNumber) && cardNumber >= 0)
    if (numbers.length === 0) {
      return Optional.empty()
    }
    if (numbers.length > 1) {
      console.log(`found multiple ${this.digitCount}-digit numbers, returning random from: ${numbers}`)
    }
    return Optional.of(numbers[Math.floor(Math.random() * numbers.length)])
  }
}

export default BarcodeParser
