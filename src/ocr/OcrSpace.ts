import axios from 'axios'
import FormData from 'form-data'
import JsonElement from '../json/JsonElement'
import Logger from '../log/Logger'
import Loggers from '../log/Loggers'

class OcrSpace {
  private static readonly LOG: Logger = Loggers.get(OcrSpace.name)

  private readonly apiKey: string;

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  recognize (imageUrl: string): Promise<Array<string>> {
    const data = new FormData()
    data.append('url', imageUrl)
    data.append('language', 'eng')
    data.append('isOverlayRequired', 'false')
    data.append('detectOrientation', 'true')
    data.append('isCreateSearchablePdf', 'false')
    data.append('scale', 'true')
    data.append('isTable', 'false')
    data.append('OCREngine', '2')
    return axios
      .post(
        'https://api.ocr.space/parse/image',
        data,
        {
          headers: {
            apikey: this.apiKey,
            ...data.getHeaders()
          }
        }
      )
      .then(
        (response) => {
          if (response.status !== 200) {
            OcrSpace.LOG.warn(`while expecting successful OCR response for ${imageUrl}: ${JSON.stringify(response)}`)
            return []
          }
          return new JsonElement('$', response.data).asObject()
            .mandatory('ParsedResults').asArray()
            .map((result) => result.asObject().mandatory('ParsedText').asString())
        }
      )
      .catch(
        (error) => {
          OcrSpace.LOG.error(`while OCRing ${imageUrl}`, error)
          return []
        }
      )
  }
}

export default OcrSpace
