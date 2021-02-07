class Arrays {
  static sequenceGroupBy<K, T> (array: Array<T>, keyFunction: (T) => K): Array<Array<T>> {
    return array.reduce(
      (groups, element) => {
        if (groups.length === 0) {
          groups.push([element])
        } else {
          const lastGroup: Array<T> = groups[groups.length - 1]
          const lastKey: K = keyFunction(lastGroup[0])
          if (lastKey !== keyFunction(element)) {
            groups.push([element])
          } else {
            lastGroup.push(element)
          }
        }
        return groups
      },
      []
    )
  }

  static getUniformElement<T> (array: Array<T>): T {
    return array.reduce(
      (left, right) => {
        if (left !== right) {
          throw new Error(`non-uniform elements in ${JSON.stringify(array)}`)
        }
        return left
      }
    )
  }
}

export default Arrays
