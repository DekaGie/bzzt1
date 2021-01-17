class LineThresholder {
  private readonly threshold: number;

  constructor (threshold: number) {
    this.threshold = threshold
  }

  public toBits (lumis: Array<number>): Array<boolean> {
    return lumis.map((lumi) => lumi < this.threshold)
  }

  public toString (): string {
    return `static(${this.threshold})`
  }
}

export default LineThresholder
