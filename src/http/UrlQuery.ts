import { ParsedQs } from 'qs'
import { Optional } from 'typescript-optional'
import HttpError from './HttpError'

class UrlQuery {
  private readonly qs: ParsedQs

  constructor (qs: ParsedQs) {
    this.qs = qs
  }

  mandatory (name: string): string {
    return this.optional(name).orElseThrow(
      () => new HttpError(400, `missing required query parameter ${name}`)
    )
  }

  optional (name: string): Optional<string> {
    const value: string | string[] | ParsedQs | ParsedQs[] | undefined = this.qs[name]
    if (value === undefined) {
      return Optional.empty()
    }
    if (typeof value === 'string') {
      return Optional.of(value)
    }
    if (Array.isArray(value)) {
      throw new HttpError(400, `more than one ${name}: ${value}`)
    }
    throw new HttpError(400, `illegal value of ${name}: ${value}`)
  }
}

export default UrlQuery
