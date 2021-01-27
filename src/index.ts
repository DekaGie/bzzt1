import App from './App'
import 'reflect-metadata'

App.start(
  {
    port: Number.parseInt(process.env.PORT, 10),
    verifyToken: process.env.VERIFY_TOKEN,
    accessToken: process.env.ACCESS_TOKEN,
    ocrSpaceApiKey: process.env.OCR_SPACE_API_KEY,
    postgresUrl: process.env.DATABASE_URL
  }
).then(
  () => {
    console.log('server is listening')
  }
)
