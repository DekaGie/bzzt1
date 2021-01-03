class Predicates {
  static isString (value: any): value is string {
    return typeof value === 'string'
  }

  static isObject (value: any): value is object {
    return typeof value === 'object' && value !== null
  }
}

export default Predicates
