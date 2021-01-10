import { Optional } from 'typescript-optional'
import ImageDownloader from '../img/ImageDownloader'
import Decoder39 from '../code39/Decoder39'

class BarcodeParser {
  parse (imageUrl: string): Promise<Optional<number>> {
    return new ImageDownloader().download(imageUrl).then(
      (image) => new Decoder39().decode(image),
      (err) => {
        console.log(`when downloading ${imageUrl}:`)
        console.log(err)
        return Optional.empty()
      }
    )
  }
}

export default BarcodeParser
