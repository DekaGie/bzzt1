import Image from './Image'

class HorizontalFlipImage implements Image {
  private readonly underlying: Image;

  constructor (underlying: Image) {
    this.underlying = underlying
  }

  width (): number {
    return this.underlying.width()
  }

  height (): number {
    return this.underlying.height()
  }

  lumiAt (x: number, y: number): number {
    return this.underlying.lumiAt(this.width() - x - 1, y)
  }
}

export default HorizontalFlipImage
