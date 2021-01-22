import JsonObject from './JsonObject'
import HttpError from '../http/HttpError'
import Predicates from '../util/Predicates'
import Predicate from '../util/Predicate'

class JsonElement {
  private readonly path: string;

  private readonly underlying: any;

  constructor (path: string, underlying: any) {
    this.path = path
    this.underlying = underlying
  }

  asObject (): JsonObject {
    this.check(Predicates.isObject, 'an object')
    return new JsonObject(this.path, this.underlying as object)
  }

  asString (): string {
    this.check(Predicates.isString, 'a string')
    return this.underlying as string
  }

  asArray (knownLength?: number): Array<JsonElement> {
    this.check(Array.isArray, 'an array')
    const array: Array<any> = this.underlying
    if (knownLength !== undefined && array.length !== knownLength) {
      throw new HttpError(
        400, `${this.path} is an array of length different than ${knownLength}: ${this.underlying}`
      )
    }
    return array.map(
      (element, index) => new JsonElement(`${this.path}[${index}]`, element)
    )
  }

  private check (predicate: Predicate<any>, description: string): void {
    if (!predicate(this.underlying)) {
      throw new HttpError(
        400, `${this.path} is not ${description}: ${this.underlying}`
      )
    }
  }

  toString (): string {
    return JSON.stringify(this.underlying)
  }
}

export default JsonElement
