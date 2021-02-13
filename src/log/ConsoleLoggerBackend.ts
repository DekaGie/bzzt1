/* eslint-disable no-console */
import { Optional } from 'typescript-optional'
import Instant from '../service/domain/Instant'
import Level from './Level'
import LoggerBackend from './LoggerBackend'

type ConsoleFunction = (any) => void

class ConsoleLoggerBackend implements LoggerBackend {
  private static readonly BY_LEVELS: Map<Level, ConsoleFunction> = new Map(
    [
      [Level.INFO, (value) => console.info(value)],
      [Level.WARN, (value) => console.warn(value)],
      [Level.ERROR, (value) => console.error(value)],
    ]
  )

  log (name: string, at: Instant, level: Level, message: string, optionalThrown: Optional<Error>): void {
    const consoleFunction: ConsoleFunction = ConsoleLoggerBackend.BY_LEVELS.get(level)
    consoleFunction(`${at} ${name}: ${message}`)
    optionalThrown.ifPresent(consoleFunction)
  }
}

export default ConsoleLoggerBackend
