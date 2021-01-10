import Jimp from 'jimp'
import Image from './Image'
import DirectImage from './DirectImage'

class ImageDownloader {
  download (url: string): Promise<Image> {
    return Jimp.read(url).then(
      (jimp) => new DirectImage(
        ImageDownloader.rgbaBytesToLumis(jimp.bitmap.data), jimp.bitmap.width
      )
    )
  }

  private static rgbaBytesToLumis (bytes: Buffer): Uint8Array {
    const length: number = bytes.length / 4
    const lumis: Uint8Array = new Uint8Array(length)
    for (let i = 0; i < length; i += 1) {
      const r: number = bytes[4 * i + 0]
      const g: number = bytes[4 * i + 1]
      const b: number = bytes[4 * i + 2]
      lumis[i] = 0.299 * r + 0.587 * g + 0.114 * b
    }
    return lumis
  }
}

export default ImageDownloader
