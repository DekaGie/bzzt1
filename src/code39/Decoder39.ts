import { Optional } from 'typescript-optional'
import Image from '../img/Image'
import LineExtractors from './LineExtractors'
import LineExtractor from './LineExtractor'
import LineEnhancer from './LineEnhancer'
import LineThresholder from './LineThresholder'
import LineParser from './LineParser'
import Combinator from './Combinator'
import Weighted from './Weighted'
import LineEnhancers from './LineEnhancers'
import Loggers from '../log/Loggers'
import Logger from '../log/Logger'

interface Settings {

  extractor: LineExtractor

  ratio: number

  enhancer: LineEnhancer

  thresholder: LineThresholder
}

class Decoder39 {
  private static readonly LOG: Logger = Loggers.get(Decoder39.name)

  private static readonly MIN_DIMENSION: number = 200

  private static readonly MIN_LINE_LENGTH: number = 1600;

  private static readonly MIN_CUMULATIVE_DIFF: number = 9 * 2 * 9 * 50

  private static readonly LINE_EXTRACTORS: Array<Weighted<LineExtractor>> = [
    Combinator.weight(LineExtractors.HORIZONTAL, 100),
    Combinator.weight(LineExtractors.VERTICAL, 90),
    Combinator.weight(LineExtractors.SLASH, 1),
    Combinator.weight(LineExtractors.BACKSLASH, 1),
  ]

  private static readonly LINE_RATIOS: Array<Weighted<number>> =
      Combinator.linearWeights(Decoder39.sample(0.2, 0.05, 0.8))

  private static readonly LINE_ENHANCERS: Array<Weighted<LineEnhancer>> = [
    Combinator.weight(LineEnhancers.equalParting(LineEnhancers.SPLINE, 250), 10),
    Combinator.weight(LineEnhancers.SPLINE, 1)
  ]

  private static readonly LINE_THRESHOLDERS: Array<Weighted<LineThresholder>> =
      Combinator.exponentialWeights(
        Decoder39.sample(0.4, 0.05, 0.6)
          .map((threshold) => new LineThresholder(threshold))
      )

  private static readonly SETTINGS: Array<Weighted<Settings>> = Combinator.combine4(
    Decoder39.LINE_EXTRACTORS,
    Decoder39.LINE_RATIOS,
    Decoder39.LINE_ENHANCERS,
    Decoder39.LINE_THRESHOLDERS
  ).map(
    (weightedArray) => Combinator.weight(
      {
        extractor: weightedArray.element[0],
        ratio: weightedArray.element[1],
        enhancer: weightedArray.element[2],
        thresholder: weightedArray.element[3]
      },
      weightedArray.weight
    )
  )

  private static readonly LINE_PARSER: LineParser = new LineParser()

  decode (image: Image): Optional<number> {
    if (image.width() < Decoder39.MIN_DIMENSION || image.height() < Decoder39.MIN_DIMENSION) {
      Decoder39.LOG.warn(`rejecting too small image: ${image.width()} x ${image.height()}`)
      return Optional.empty()
    }

    const started: number = new Date().getTime()
    let cumulative: number = 0
    for (let si: number = 0; si < Decoder39.SETTINGS.length; si += 1) {
      const weightedSettings: Weighted<Settings> = Decoder39.SETTINGS[si]
      const settings: Settings = weightedSettings.element
      const probability: number = weightedSettings.weight
      const rawLine: Uint8Array = settings.extractor.extract(image, settings.ratio)
      if (Decoder39.canContain(rawLine)) {
        const enhancedLine: Array<number> = settings.enhancer.enhance(rawLine, Decoder39.MIN_LINE_LENGTH)
        const thresholdedLine: Array<boolean> = settings.thresholder.toBits(enhancedLine)
        const detected: Optional<number> = Decoder39.LINE_PARSER.parse(thresholdedLine)
        if (detected.isPresent()) {
          Decoder39.LOG.debug(
            `found ${detected.get()} in ${new Date().getTime() - started} ms, `
              + `by ${JSON.stringify(settings, (key, value) => (key === '' ? value : value.toString()))} `
              + `having probability ${probability}, after unrealized ${cumulative} `
              + `(${si} / ${Decoder39.SETTINGS.length})`
          )
          return detected
        }
      }
      cumulative += probability
    }
    return Optional.empty()
  }

  private static sample (min: number, step: number, max: number): Array<number> {
    const samples: Array<number> = []
    let i: number = 0
    const mean: number = (min + max) / 2
    samples.push(mean)
    while (true) {
      i += 1
      const deviation: number = i * step
      if (mean + deviation > max) {
        break
      }
      samples.push(mean - deviation, mean + deviation)
    }
    return samples
  }

  private static canContain (rawLine: Uint8Array): boolean {
    let cumulativeDiff: number = 0
    let previous: number = rawLine[0]
    for (let i: number = 1; i < rawLine.length; i += 1) {
      const current: number = rawLine[i]
      cumulativeDiff += Math.abs(current - previous)
      previous = current
    }
    return cumulativeDiff >= Decoder39.MIN_CUMULATIVE_DIFF
  }
}

export default Decoder39
