class Predicates {
  static isString (value: any): value is string {
    return typeof value === 'string'
  }

  static isObject (value: any): value is object {
    return typeof value === 'object' && value !== null
  }

  static isArray (value: any): value is Array<any> {
    return Array.isArray(value.isArray)
  }
}

export default Predicates
