class BitStream {
  private readonly array: Array<boolean>;

  private index: number;

  constructor (array: Array<boolean>, index: number = 0) {
    this.array = array
    this.index = index
  }

  next (): boolean | undefined {
    if (this.index === this.array.length) {
      return undefined
    }
    const bit: boolean = this.array[this.index]
    this.index += 1
    return bit
  }

  split (): BitStream {
    return new BitStream(this.array, this.index)
  }
}

export default BitStream
