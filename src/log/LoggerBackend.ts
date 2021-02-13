import { Optional } from 'typescript-optional'
import Level from './Level'
import Instant from '../service/domain/Instant'

interface LoggerBackend {

  log (name: string, at: Instant, level: Level, message: string, thrown: Optional<Error>): void
}

export default LoggerBackend
