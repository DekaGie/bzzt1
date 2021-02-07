class Promises {
  static safely<T> (asyncFunction: () => Promise<T>): Promise<T> {
    try {
      return asyncFunction()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  static ensurePromise<T> (arg: T | Promise<T>): Promise<T> {
    if (arg instanceof Promise) {
      return arg
    }
    return Promise.resolve(arg)
  }

  static sequential<T> (groups: Array<T>, promiser: (T) => Promise<void>): Promise<void> {
    return groups.reduce(
      (promise, group) => promise.then(() => promiser(group)),
      Promise.resolve()
    )
  }
}

export default Promises
