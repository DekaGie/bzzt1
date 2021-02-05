class ImageUrl {
  private readonly url: string;

  constructor (url: string) {
    this.url = url
  }

  asString (): string {
    return this.url
  }
}

export default ImageUrl
