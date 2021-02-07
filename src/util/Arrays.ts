class Arrays {
  static sequenceGroupBy<K, T> (array: Array<T>, keyFunction: (T) => K): Array<[K, Array<T>]> {
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
}

export default Arrays
