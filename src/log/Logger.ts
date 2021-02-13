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

  error (message: string, thrown?: Error | undefined) {
    this.backend.log(this.name, Instant.now(), Level.ERROR, message, Optional.ofNullable(thrown))
  }
}

export default Logger
