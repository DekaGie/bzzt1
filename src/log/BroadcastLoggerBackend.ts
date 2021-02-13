import { Optional } from 'typescript-optional'
import Instant from '../service/domain/Instant'
import Level from './Level'
import LoggerBackend from './LoggerBackend'

class BroadcastLoggerBackend implements LoggerBackend {
  private underlyings: Array<LoggerBackend>;

  constructor (...underlyings: Array<LoggerBackend>) {
    this.underlyings = underlyings
  }

  log (name: string, at: Instant, level: Level, message: string, optionalThrown: Optional<Error>): void {
    this.underlyings.forEach(
      (underlying) => underlying.log(name, at, level, message, optionalThrown)
    )
  }
}

export default BroadcastLoggerBackend
