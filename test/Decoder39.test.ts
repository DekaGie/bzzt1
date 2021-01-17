import { Optional } from 'typescript-optional'
import ImageDownloader from '../src/img/ImageDownloader'
import Decoder39 from '../src/code39/Decoder39'

describe('Code-39 Decoder', () => {
  it('decodes a slanted, small, non-central code', () => {
    expect.assertions(1)
    return new ImageDownloader()
      .download('https://scontent.xx.fbcdn.net/v/t1.15752-9/136979701_737170333573794_859856763173942560_n.jpg?_nc_cat=109&ccb=2&_nc_sid=58c789&_nc_ohc=HJYXN4sJZoYAX-H9w6x&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=915e0f36c1eb89e2757c5df80b739a19&oe=60222A24')
      .then(
        (image) => {
          const decoded: Optional<number> = new Decoder39().decode(image)
          expect(decoded.get()).toBe(138482385)
        }
      )
  })
})
