import { Optional } from 'typescript-optional'
import { HashMap, JMap } from 'typescriptcollectionsframework'
import ImageDownloader from '../../img/ImageDownloader'
import ImageUrl from '../domain/ImageUrl'
import OcrSpace from '../../ocr/OcrSpace'
import Decoder39 from '../../code39/Decoder39'
import Logger from '../../log/Logger'
import Loggers from '../../log/Loggers'

class BarcodeParser {
  private static readonly LOG: Logger = Loggers.get(BarcodeParser.name)

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

  private readonly decoder: Decoder39;

  constructor (decoder: Decoder39, ocrSpace: OcrSpace, digitCount: number = 9) {
    this.decoder = decoder
    this.ocrSpace = ocrSpace
    this.digitCount = digitCount
  }

  parse (url: ImageUrl): Promise<Optional<number>> {
    const imageUrl: string = url.asString()
    return new ImageDownloader().download(imageUrl)
      .then(
        (image) => {
          const decoded: Optional<number> = this.decoder.decode(image)
          if (decoded.isPresent()) {
            BarcodeParser.LOG.debug(`parsed locally ${decoded.get()}: ${imageUrl}`)
            return decoded
          }
          return this.ocrSpace.recognize(imageUrl)
            .then((texts) => this.findNumber(texts))
        }
      )
      .catch(
        (error) => {
          BarcodeParser.LOG.error(`when parsing barcode on ${imageUrl}`, error)
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
      BarcodeParser.LOG.debug(`found multiple ${this.digitCount}-digit numbers, returning random from: ${numbers}`)
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
