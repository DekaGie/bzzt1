import LineExtractor from './LineExtractor'
import Image from '../img/Image'
import TransposedImage from '../img/TransposedImage'
import HorizontalFlipImage from '../img/HorizontalFlipImage'

class LineExtractors {
  static HORIZONTAL: LineExtractor = {

    extract (image: Image, ratio: number): Uint8Array {
      const y: number = Math.floor(image.height() * ratio)
      const w: number = image.width()
      const lumis: Uint8Array = new Uint8Array(w)
      for (let x: number = 0; x < w; x += 1) {
        lumis[x] = image.lumiAt(x, y)
      }
      return lumis
    }
  }

  static VERTICAL: LineExtractor = {

    extract (image: Image, ratio: number): Uint8Array {
      return LineExtractors.HORIZONTAL.extract(new TransposedImage(image), ratio)
    }
  }

  static SLASH: LineExtractor = {

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
  }

  static BACKSLASH: LineExtractor = {

    extract (image: Image, ratio: number): Uint8Array {
      return LineExtractors.SLASH.extract(new HorizontalFlipImage(image), ratio)
    }
  }

  static backward (underlying: LineExtractor) {
    return {

      extract (image: Image, ratio: number): Uint8Array {
        return underlying.extract(image, ratio).reverse()
      }
    }
  }
}

export default LineExtractors
