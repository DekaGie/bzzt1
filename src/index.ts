import App from './App'
import 'reflect-metadata'
import Loggers from './log/Loggers'
import Logger from './log/Logger'

const logger: Logger = Loggers.get('boot-up')

App.start(
  {
    port: Number.parseInt(process.env.PORT, 10),
    verifyToken: process.env.VERIFY_TOKEN,
    accessToken: process.env.ACCESS_TOKEN,
    ocrSpaceApiKey: process.env.OCR_SPACE_API_KEY,
    postgresUrl: process.env.DATABASE_URL,
    esUrl: process.env.ES_URL
  }
).then(
  () => {
    logger.info('boot-up successful')
  },
  (error) => {
    logger.error('could not boot-up', error)
  }
)
