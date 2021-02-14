abstract class AnyId {
  private readonly representation: string;

  constructor (representation: string) {
    this.representation = representation
  }

  abstract typeName (): string

  equalTo (other: this): boolean {
    return this.typeName() === other.typeName() && this.representation === other.representation
  }

  toRepresentation (): string {
    return this.representation
  }

  toString (): string {
    return `${this.typeName()}(${this.representation})`
  }
}

export default AnyId
