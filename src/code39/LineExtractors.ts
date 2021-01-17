// eslint-disable-next-line max-classes-per-file
import LineExtractor from './LineExtractor'
import Image from '../img/Image'
import TransposedImage from '../img/TransposedImage'
import HorizontalFlipImage from '../img/HorizontalFlipImage'

class LineExtractors {
  static HORIZONTAL: LineExtractor = new class implements LineExtractor {
    extract (image: Image, ratio: number): Uint8Array {
      const y: number = Math.floor(image.height() * ratio)
      const w: number = image.width()
      const lumis: Uint8Array = new Uint8Array(w)
      for (let x: number = 0; x < w; x += 1) {
        lumis[x] = image.lumiAt(x, y)
      }
      return lumis
    }

    toString (): string {
      return 'horizontal'
    }
  }()

  static VERTICAL: LineExtractor = new class implements LineExtractor {
    extract (image: Image, ratio: number): Uint8Array {
      return LineExtractors.HORIZONTAL.extract(new TransposedImage(image), ratio)
    }

    toString (): string {
      return 'vertical'
    }
  }()

  static SLASH: LineExtractor = new class implements LineExtractor {
    extract (image: Image, ratio: number): Uint8Array {
      const w: number = image.width()
      const h: number = image.height()
      if (w < h) {
        return LineExtractors.SLASH.extract(new TransposedImage(image), ratio).reverse()
      }
      const vWidth: number = w + h
      const lumis: Uint8Array = new Uint8Array(h)
      let vX: number = Math.floor(vWidth * ratio)
      let at: number = 0
      for (let y: number = 0; y < h; y += 1, vX -= 1) {
        if (vX >= 0 && vX < w) {
          lumis[at] = image.lumiAt(vX, y)
          at += 1
        }
      }
      return at === lumis.length ? lumis : lumis.slice(0, at)
    }

    toString (): string {
      return 'slash'
    }
  }()

  static BACKSLASH: LineExtractor = new class implements LineExtractor {
    extract (image: Image, ratio: number): Uint8Array {
      return LineExtractors.SLASH.extract(new HorizontalFlipImage(image), ratio)
    }

    toString (): string {
      return 'backslash'
    }
  }()
}

export default LineExtractors
