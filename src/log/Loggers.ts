import { Optional } from 'typescript-optional'
import LoggerBackend from './LoggerBackend'
import Logger from './Logger'
import ConsoleLoggerBackend from './ConsoleLoggerBackend'
import Instant from '../service/domain/Instant'
import Level from './Level'

class Loggers {
  private static BACKEND: LoggerBackend = new ConsoleLoggerBackend()

  private static readonly PROXY: LoggerBackend = {
    log (name: string, at: Instant, level: Level, message: string, thrown: Optional<Error>) {
      Loggers.BACKEND.log(name, at, level, message, thrown)
    }
  }

  static get (name: string) {
    return new Logger(Loggers.PROXY, name)
  }

  static initialize (backend: LoggerBackend) {
    Loggers.BACKEND = backend
  }
}

export default Loggers
