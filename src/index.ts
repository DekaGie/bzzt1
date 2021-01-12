import App from './App'

App.start(
  {
    port: Number.parseInt(process.env.PORT, 10),
    verifyToken: process.env.VERIFY_TOKEN,
    accessToken: process.env.ACCESS_TOKEN,
    ocrSpaceApiKey: process.env.OCR_SPACE_API_KEY
  }
).then(
  () => {
    console.log('server is listening')
  }
)
