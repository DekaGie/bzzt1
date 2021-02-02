import axios from 'axios'
import FormData from 'form-data'
import JsonElement from '../json/JsonElement'

class OcrSpace {
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
            console.error(`while expecting successful OCR response for ${imageUrl}:`)
            console.error(response)
            return []
          }
          return new JsonElement('$', response.data).asObject()
            .mandatory('ParsedResults').asArray()
            .map((result) => result.asObject().mandatory('ParsedText').asString())
        }
      )
      .catch(
        (error) => {
          console.error(`while OCRing ${imageUrl}:`)
          console.error(error)
          return []
        }
      )
  }
}

export default OcrSpace
