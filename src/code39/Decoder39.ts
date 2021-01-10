import { Optional } from 'typescript-optional'
import Image from '../img/Image'
import Code39Symbol from './Code39Symbol'
import Code39Symbols from './Code39Symbols'
import BitStream from './BitStream'
import LineExtractors from './LineExtractors'
import LineExtractor from './LineExtractor'

class Decoder39 {
  private static MAX_JITTER: number = 0.8

  private static MIN_DISCRIMINATION: number = 1.5;

  private static MAX_DISCRIMINATION: number = 3.5;

  private static BIT_LUMI_THRESHOLDS: Array<number> = [60, 120, 30, 180, 90]

  private static SAMPLED_LINE_RATIOS: Array<number> =
      [0.5, 0.4, 0.6, 0.3, 0.7, 0.45, 0.55, 0.35, 0.65, 0.2, 0.8, 0.1, 0.9]

  private static LINE_EXTRACTORS: Array<LineExtractor> = [
    LineExtractors.HORIZONTAL,
    LineExtractors.VERTICAL,
    LineExtractors.backward(LineExtractors.HORIZONTAL),
    LineExtractors.backward(LineExtractors.VERTICAL),
    LineExtractors.SLASH,
    LineExtractors.backward(LineExtractors.SLASH),
    LineExtractors.BACKSLASH,
    LineExtractors.backward(LineExtractors.BACKSLASH)
  ]

  decode (image: Image): Optional<number> {
    if (image.width() === 0 || image.height() === 0) {
      throw new Error('invalid image dimensions')
    }
    for (let li: number = 0; li < Decoder39.LINE_EXTRACTORS.length; li += 1) {
      const lineExtractor: LineExtractor = Decoder39.LINE_EXTRACTORS[li]
      for (let ri: number = 0; ri < Decoder39.SAMPLED_LINE_RATIOS.length; ri += 1) {
        const ratio: number = Decoder39.SAMPLED_LINE_RATIOS[ri]
        const lineLumis: Uint8Array = lineExtractor.extract(image, ratio)
        const detected: Optional<number> = this.scanLumis(lineLumis)
        if (detected.isPresent()) {
          return detected
        }
      }
    }
    return Optional.empty()
  }

  private scanLumis (lumis: Uint8Array): Optional<number> {
    const bits: Array<boolean> = new Array<boolean>(lumis.length)
    for (let bi: number = 0; bi < Decoder39.BIT_LUMI_THRESHOLDS.length; bi += 1) {
      const bitLumiThreshold = Decoder39.BIT_LUMI_THRESHOLDS[bi]
      for (let i: number = 0; i < lumis.length; i += 1) {
        bits[i] = lumis[i] < bitLumiThreshold
      }
      const detected: Optional<number> = this.scanBitsUntilNumber(new BitStream(bits))
      if (detected.isPresent()) {
        return detected
      }
    }
    return Optional.empty()
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
          } else {
            return Optional.of(result)
          }
        } else {
          const digit: number | undefined = Code39Symbols.DIGITS.get(symbol)
          if (digit === undefined) {
            useBits = fallback
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
    const narrowCount: number = Decoder39.findMaxDerivativeIndex(sortedRuns)
    if (narrowCount === 0 || narrowCount === runs.length) {
      return Optional.empty()
    }
    const narrows: Array<number> = sortedRuns.slice(0, narrowCount)
    const narrowSpan: number = narrows[narrows.length - 1] - narrows[0]
    const meanNarrow: number = narrows.reduce((left, right) => left + right) / narrows.length
    if (narrowSpan / meanNarrow > Decoder39.MAX_JITTER) {
      return Optional.empty()
    }
    const wides: Array<number> = sortedRuns.slice(narrowCount, sortedRuns.length)
    const wideSpan: number = wides[wides.length - 1] - wides[0]
    const meanWide: number = wides.reduce((left, right) => left + right) / wides.length
    if (wideSpan / meanWide > Decoder39.MAX_JITTER) {
      return Optional.empty()
    }
    if (!Decoder39.within(meanWide / meanNarrow, Decoder39.MIN_DISCRIMINATION, Decoder39.MAX_DISCRIMINATION)) {
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

export default Decoder39
