class Promises {
  static safely<T> (asyncFunction: () => Promise<T>): Promise<T> {
    try {
      return asyncFunction()
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export default Promises
