import Image from './Image'

class TransposedImage implements Image {
  private readonly underlying: Image;

  constructor (underlying: Image) {
    this.underlying = underlying
  }

  width (): number {
    return this.underlying.height()
  }

  height (): number {
    return this.underlying.width()
  }

  lumiAt (x: number, y: number): number {
    return this.underlying.lumiAt(y, x)
  }
}

export default TransposedImage
