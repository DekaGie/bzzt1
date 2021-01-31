class Objects {
  static define<T> (reference: T | null | undefined): T | null {
    if (reference === undefined) {
      return null
    }
    return reference
  }
}

export default Objects
