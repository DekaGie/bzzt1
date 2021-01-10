import Image from './Image'

class DirectImage implements Image {
  private readonly lineLength: number

  private readonly lumis: Uint8Array;

  constructor (lumis: Uint8Array, lineLength: number) {
    this.lumis = lumis
    this.lineLength = lineLength
  }

  width (): number {
    return this.lineLength
  }

  height (): number {
    return this.lumis.length / this.lineLength
  }

  lumiAt (x: number, y: number): number {
    return this.lumis[y * this.lineLength + x]
  }
}

export default DirectImage
