import { Optional } from 'typescript-optional'
import { ParamsDictionary } from 'express-serve-static-core'
import HttpError from './HttpError'

class UrlPath {
  private readonly params: ParamsDictionary

  constructor (params: ParamsDictionary) {
    this.params = params
  }

  part (name: string): string {
    return Optional.ofNullable(this.params[name]).orElseThrow(
      () => new HttpError(500, `no path parameter ${name} is defined`)
    )
  }
}

export default UrlPath
