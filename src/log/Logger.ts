import { Optional } from 'typescript-optional'
import Instant from '../service/domain/Instant'
import Level from './Level'
import LoggerBackend from './LoggerBackend'

class Logger {
  private readonly backend: LoggerBackend;

  private readonly name: string;

  constructor (backend: LoggerBackend, name: string) {
    this.backend = backend
    this.name = name
  }

  debug (message: string): void {
    this.backend.log(this.name, Instant.now(), Level.DEBUG, message, Optional.empty())
  }

  info (message: string): void {
    this.backend.log(this.name, Instant.now(), Level.INFO, message, Optional.empty())
  }

  warn (message: string, thrown?: Error | undefined): void {
    this.backend.log(this.name, Instant.now(), Level.WARN, message, Optional.ofNullable(thrown))
  }

  error (message: string, thrown: Error): void {
    this.backend.log(this.name, Instant.now(), Level.ERROR, message, Optional.of(thrown))
  }
}

export default Logger
