abstract class AnyId {
  private readonly representation: string;

  constructor (representation: string) {
    this.representation = representation
  }

  abstract typeName (): string

  toRepresentation (): string {
    return this.representation
  }

  toString (): string {
    return `${this.typeName()}(${this.representation})`
  }
}

export default AnyId
