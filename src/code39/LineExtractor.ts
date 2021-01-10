import Image from '../img/Image'

interface LineExtractor {

  extract (image: Image, ratio: number): Uint8Array
}

export default LineExtractor
