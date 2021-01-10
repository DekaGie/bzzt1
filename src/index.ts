import App from './App'

App.start(
  {
    port: Number.parseInt(process.env.PORT, 10),
    verifyToken: process.env.VERIFY_TOKEN,
    accessToken: process.env.ACCESS_TOKEN
  }
).then(
  () => {
    console.log('server is listening')
  }
)
