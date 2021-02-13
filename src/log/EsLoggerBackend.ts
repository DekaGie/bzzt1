import { Optional } from 'typescript-optional'
import Instant from '../service/domain/Instant'
import Level from './Level'
import LoggerBackend from './LoggerBackend'
import EsClient from '../es/EsClient'
import EsIndex from '../es/EsIndex'

class EsLoggerBackend implements LoggerBackend {
  private index: Promise<EsIndex>;

  constructor (client: EsClient) {
    this.index = client.createIndex(
      'logs',
      {
        name: { type: 'keyword' },
        at: { type: 'date', format: 'epoch_millis' },
        level: { type: 'keyword' },
        message: { type: 'text' },
        thrown: { type: 'text' },
        stack: { type: 'text' }
      }
    )
  }

  log (name: string, at: Instant, level: Level, message: string, optionalThrown: Optional<Error>): void {
    this.index.then(
      (successful) => successful.insert(
        {
          name,
          at: at.asEms(),
          level: Level[level],
          message,
          thrown: optionalThrown.map((thrown) => thrown.toString()).orNull(),
          stack: optionalThrown.flatMap((thrown) => Optional.of(thrown.stack))
            .map((stack) => stack.split('\n'))
            .orElse([])
        }
      )
    ).catch(
      (error) => {
        console.error(`while logging: ${Level[level]} ${message}`)
        optionalThrown.ifPresent((thrown) => console.error(thrown))
        console.error(error)
      }
    )
  }
}

export default EsLoggerBackend
