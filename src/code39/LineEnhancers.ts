// eslint-disable-next-line max-classes-per-file
import Spline from 'cubic-spline-ts'
import LineEnhancer from './LineEnhancer'

class LineEnhancers {
  static SPLINE: LineEnhancer = new class implements LineEnhancer {
    enhance (lumis: Uint8Array, size: number): Array<number> {
      const spline: Spline = new Spline(Array.from(lumis.keys()), Array.from(lumis))
      const upYs: Array<number> = new Array(Math.max(lumis.length, size))
      let minY: number = Number.POSITIVE_INFINITY
      let maxY: number = Number.NEGATIVE_INFINITY
      for (let i = 0; i < upYs.length; i += 1) {
        const upY: number = spline.at((i * (lumis.length - 1)) / (upYs.length - 1))
        upYs[i] = upY
        if (upY < minY) {
          minY = upY
        }
        if (upY > maxY) {
          maxY = upY
        }
      }
      return upYs.map((upY) => (upY - minY) / (maxY - minY))
    }

    toString () : string {
      return 'spline'
    }
  }()

  static equalParting (
    underlying: LineEnhancer,
    expectedPartSize: number
  ): LineEnhancer {
    return new class implements LineEnhancer {
      enhance (lumis: Uint8Array, size: number): Array<number> {
        let covered: number = 0
        const enhanced: Array<number> = []
        for (let at: number = 0; at < lumis.length; at += expectedPartSize) {
          const partSize: number = Math.min(expectedPartSize, lumis.length - at)
          const part: Uint8Array = lumis.slice(at, at + partSize)
          const expectedCovered: number = Math.round(((at + partSize) * size) / lumis.length)
          enhanced.push(...underlying.enhance(part, expectedCovered - covered))
          covered = expectedCovered
        }
        return enhanced
      }

      toString (): string {
        return `equalParting(${underlying}, ${expectedPartSize})`
      }
    }()
  }
}

export default LineEnhancers
