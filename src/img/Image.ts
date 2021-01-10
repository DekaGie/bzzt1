interface Image {
  width (): number

  height (): number

  lumiAt (x: number, y: number): number
}

export default Image
