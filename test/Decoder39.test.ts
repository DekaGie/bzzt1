import { Optional } from 'typescript-optional'
import ImageDownloader from '../src/img/ImageDownloader'
import Decoder39 from '../src/code39/Decoder39'

describe('Code-39 Decoder', () => {
  it('decodes a slanted, small, non-central code', () => {
    expect.assertions(1)
    return new ImageDownloader()
      .download('https://iv.pl/images/a7060242b89746a5849cfe83c5ae65ce.jpg')
      .then(
        (image) => {
          const decoded: Optional<number> = new Decoder39().decode(image)
          expect(decoded.get()).toBe(138482385)
        }
      )
  })
})
