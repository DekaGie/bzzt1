import App from './App'

App.start(
  {
    port: parseFloat(process.env.PORT),
    verifyToken: process.env.VERIFY_TOKEN
  }
).then(
  () => {
    console.log('server is listening')
  }
)
