import { Hashable } from 'typescriptcollectionsframework'
import { Optional } from 'typescript-optional'

class Code39Symbol {
  static HASHABLE: Hashable<Code39Symbol> = {

    hashCode (object: Code39Symbol): number {
      return object.isWide
        .map((value, index) => (value ? 7 : 13) * (index + 1))
        .reduce((left, right) => left + right)
    },

    equals (left: Code39Symbol, right: Code39Symbol): boolean {
      for (let i = 0; i < Code39Symbol.STRIPE_COUNT; i += 1) {
        if (left.isWide[i] !== right.isWide[i]) {
          return false
        }
      }
      return true
    }
  }

  static STRIPE_COUNT: number = 9

  static WIDE_COUNT: number = 3

  static NARROW_COUNT: number = Code39Symbol.STRIPE_COUNT - Code39Symbol.WIDE_COUNT

  private readonly isWide: Array<boolean>;

  constructor (isWide: Array<boolean>) {
    this.isWide = isWide
  }

  toString (): string {
    return this.isWide
      // eslint-disable-next-line no-nested-ternary
      .map((is, index) => <string>(index % 2 === 0 ? (is ? 'XXX' : 'X') : (is ? '   ' : ' ')))
      .reduce((left, right) => left + right)
  }

  static valid (...isWide: Array<boolean>): Code39Symbol {
    if (!this.areValid(isWide)) {
      throw new Error(`not valid const: ${isWide}`)
    }
    return new Code39Symbol(isWide)
  }

  static potential (isWide: Array<boolean>): Optional<Code39Symbol> {
    if (!Code39Symbol.areValid(isWide)) {
      return Optional.empty()
    }
    return Optional.of(new Code39Symbol(isWide))
  }

  private static areValid (isWide: Array<boolean>): boolean {
    if (isWide.length !== Code39Symbol.STRIPE_COUNT) {
      return false
    }
    const wideCount: number = isWide.filter((wide) => wide).length
    if (wideCount !== Code39Symbol.WIDE_COUNT) {
      return false
    }
    return true
  }
}

export default Code39Symbol
