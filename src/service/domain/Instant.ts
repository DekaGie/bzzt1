class Instant {
  private readonly es: number;

  constructor (es: number) {
    this.es = es
  }

  asEs (): number {
    return this.es
  }

  asEms (): number {
    return Math.floor(this.es * 1000)
  }

  isAtOrAfter (other: Instant): boolean {
    return this.es >= other.es
  }

  toString (): string {
    return new Date(this.asEms()).toISOString()
  }

  toDateString (): string {
    const date: Date = new Date(this.asEms())
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
  }

  static now (): Instant {
    return new Instant(new Date().getTime() / 1000)
  }
}

export default Instant
