import { Optional } from 'typescript-optional'
import { HashMap, JMap } from 'typescriptcollectionsframework'
import OcrSpace from '../ocr/OcrSpace'

class BarcodeParser {
  private static readonly DIGIT_FIXES: JMap<string, number> = (() => {
    const map: JMap<string, number> = new HashMap()
    map.put('O', 0)
    map.put('D', 0)
    map.put('o', 0)
    map.put('Q', 0)
    map.put('l', 1)
    map.put('t', 1)
    map.put('I', 1)
    map.put('z', 2)
    map.put('Z', 2)
    map.put('s', 3)
    map.put('A', 4)
    map.put('S', 5)
    map.put('G', 6)
    map.put('b', 6)
    map.put('T', 7)
    map.put('B', 8)
    map.put('q', 9)
    map.put('g', 9)
    return map
  })()

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
      .map((word) => this.fixDigits(word))
      .filter((word) => /^\d*$/.test(word))
      .map((word) => Number.parseInt(word, 10))
    if (numbers.length === 0) {
      return Optional.empty()
    }
    if (numbers.length > 1) {
      console.log(`found multiple ${this.digitCount}-digit numbers, returning random from: ${numbers}`)
    }
    return Optional.of(numbers[Math.floor(Math.random() * numbers.length)])
  }

  private fixDigits (chars: string): string {
    return Array.from(chars)
      .map((char) => (BarcodeParser.DIGIT_FIXES.get(char) || char).toString())
      .reduce((left, right) => left + right, '')
  }
}

export default BarcodeParser
