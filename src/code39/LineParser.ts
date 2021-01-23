import { Optional } from 'typescript-optional'
import Code39Symbol from './Code39Symbol'
import Code39Symbols from './Code39Symbols'
import BitStream from './BitStream'

class LineParser {
  private static readonly MAX_JITTER: number = 0.8

  private static readonly MIN_DISCRIMINATION: number = 1.5;

  private static readonly MAX_DISCRIMINATION: number = 3.5;

  parse (bits: Array<boolean>): Optional<number> {
    return this.scanBitsUntilNumber(new BitStream(bits))
      .or(() => this.scanBitsUntilNumber(new BitStream(bits.reverse())))
  }

  private scanBitsUntilNumber (bits: BitStream): Optional<number> {
    let useBits: BitStream = bits
    while (true) {
      if (!this.scanBitsUntilDelimiter(useBits)) {
        return Optional.empty()
      }
      const fallback: BitStream = bits.split()
      let result: number = -1
      while (true) {
        const maybeSymbol: Optional<Code39Symbol> = this.scanBitsForSymbol(useBits)
        if (!maybeSymbol.isPresent()) {
          return Optional.empty()
        }
        const symbol: Code39Symbol = maybeSymbol.get()
        if (Code39Symbol.HASHABLE.equals(symbol, Code39Symbols.DELIMITER)) {
          if (result === -1) {
            useBits = fallback
            break
          } else {
            return Optional.of(result)
          }
        } else {
          const digit: number | undefined = Code39Symbols.DIGITS.get(symbol)
          if (digit === undefined) {
            useBits = fallback
            break
          }
          result = result === -1 ? digit : (result * 10 + digit)
        }
      }
    }
  }

  private scanBitsForSymbol (bits: BitStream): Optional<Code39Symbol> {
    return this.scanBitsForIsWide(bits, Code39Symbol.STRIPE_COUNT)
      .flatMap(Code39Symbol.potential)
  }

  private scanBitsForIsWide (bits: BitStream, count: number): Optional<Array<boolean>> {
    while (true) {
      const bit: boolean | undefined = bits.next()
      if (bit === undefined) {
        return Optional.empty()
      }
      if (bit === true) {
        break
      }
    }
    const runs: Array<number> = []
    let run: number = 1
    let previousBit: boolean = true
    while (true) {
      const bit: boolean | undefined = bits.next()
      if (bit === undefined) {
        if (runs.length === count) {
          return this.detectIsWide(runs)
        }
        return Optional.empty()
      }
      if (bit === previousBit) {
        run += 1
      } else {
        runs.push(run)
        if (bit === false && runs.length === count) {
          return this.detectIsWide(runs)
        }
        run = 1
        previousBit = bit
      }
    }
  }

  private detectIsWide (runs: Array<number>): Optional<Array<boolean>> {
    const sortedRuns: Array<number> = runs.slice().sort((left, right) => left - right)
    const narrowCount: number = LineParser.findMaxDerivativeIndex(sortedRuns)
    if (narrowCount === 0 || narrowCount === runs.length) {
      return Optional.empty()
    }
    const narrows: Array<number> = sortedRuns.slice(0, narrowCount)
    const narrowSpan: number = narrows[narrows.length - 1] - narrows[0]
    const meanNarrow: number = narrows.reduce((left, right) => left + right) / narrows.length
    if (narrowSpan / meanNarrow > LineParser.MAX_JITTER) {
      return Optional.empty()
    }
    const wides: Array<number> = sortedRuns.slice(narrowCount, sortedRuns.length)
    const wideSpan: number = wides[wides.length - 1] - wides[0]
    const meanWide: number = wides.reduce((left, right) => left + right) / wides.length
    if (wideSpan / meanWide > LineParser.MAX_JITTER) {
      return Optional.empty()
    }
    if (!LineParser.within(meanWide / meanNarrow, LineParser.MIN_DISCRIMINATION, LineParser.MAX_DISCRIMINATION)) {
      return Optional.empty()
    }
    return Optional.of(runs.map((run) => run >= wides[0]))
  }

  private scanBitsUntilDelimiter (bits: BitStream): boolean {
    const runs: Array<number> = new Array<number>(Code39Symbol.STRIPE_COUNT)
    runs.fill(1)
    let previousBit: boolean = false
    while (true) {
      const bit: boolean | undefined = bits.next()
      if (bit === undefined) {
        return false
      }
      if (bit === previousBit) {
        runs[Code39Symbol.STRIPE_COUNT - 1] += 1
      } else {
        if (bit === false) {
          const isDelimiter: boolean = this.detectIsWide(runs)
            .flatMap(Code39Symbol.potential)
            .filter((symbol) => Code39Symbol.HASHABLE.equals(symbol, Code39Symbols.DELIMITER))
            .isPresent()
          if (isDelimiter) {
            return true
          }
        }
        runs.shift()
        runs.push(1)
        previousBit = bit
      }
    }
  }

  private static within (subject: number, reference: number, tolerance: number): boolean {
    return subject - tolerance <= reference && subject + tolerance >= reference
  }

  private static findMaxDerivativeIndex (values: Array<number>): number {
    let maxDerivative: number = -1
    let index: number = -1
    for (let i: number = 1; i < values.length; i += 1) {
      const derivative = values[i] - values[i - 1]
      if (derivative > maxDerivative) {
        maxDerivative = derivative
        index = i
      }
    }
    return index
  }
}

export default LineParser
