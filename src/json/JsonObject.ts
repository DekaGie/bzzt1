import { Optional } from 'typescript-optional'
import HttpError from '../http/HttpError'
import JsonElement from './JsonElement'

class JsonObject {
  private readonly path: string;

  private readonly underlying: object

  constructor (path: string, underlying: object) {
    this.path = path
    this.underlying = underlying
  }

  mandatory (name: string): JsonElement {
    return this.optional(name).orElseThrow(
      () => new HttpError(400, `${this.path} is missing a required property ${name}: ${this.underlying}`)
    )
  }

  optional (name: string): Optional<JsonElement> {
    return Optional.ofNullable(this.underlying[name])
      .map((value) => new JsonElement(`${this.path}.${name}`, value))
  }

  toString (): string {
    return JSON.stringify(this.underlying)
  }
}

export default JsonObject
