import JsonElement from '../json/JsonElement'
import HttpError from './HttpError'

class RequestBody {
  private readonly body: Buffer

  constructor (body: Buffer) {
    this.body = body
  }

  asJson (): JsonElement {
    const asString: string = this.body.toString('utf-8')
    try {
      return new JsonElement('$', JSON.parse(asString))
    } catch (error) {
      throw new HttpError(400, `unreadable JSON: ${asString}`, error)
    }
  }
}

export default RequestBody
