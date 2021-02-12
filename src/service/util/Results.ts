import Promises from '../../util/Promises'

class Results {
  static many<T> (...args: Array<T | Promise<T>>): Promise<Array<T>> {
    switch (args.length) {
      case 0: return Promise.resolve([])
      case 1: return Promises.ensurePromise(args[0]).then((result) => [result])
      default: return Promise.all(args.map((arg) => Promises.ensurePromise(arg)))
    }
  }
}

export default Results
