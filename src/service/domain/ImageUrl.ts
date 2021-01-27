class ImageUrl {
  private readonly url: string;

  constructor (url: string) {
    this.url = url
  }

  asString () {
    return this.url
  }
}

export default ImageUrl
