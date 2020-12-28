import app from './App'

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('server is listening')
  }
})
