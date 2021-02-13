import LoggerBackend from './LoggerBackend'
import Logger from './Logger'

class Loggers {
  private static BACKEND: LoggerBackend;

  static get (name: string) {
    return new Logger(Loggers.BACKEND, name)
  }

  static initialize (backend: LoggerBackend) {
    Loggers.BACKEND = backend
  }
}

export default Loggers
