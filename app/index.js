
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { createOrUpdateProject } = require('./updater')
const Boom = require('boom')

const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => res.send('Welcome to the updater 🤪'))

app.get('/update', async (req, res, next) => {
  const output = await createOrUpdateProject(req.query)
    .catch(err => next(err))
  res.send(output)
})
app.post('/update', async (req, res, next) => {
  const output = await createOrUpdateProject(req.body)
    .catch(err => next(err))
  res.send(output)
})

app.use((err, req, res, next) => {
  if (!err) {
    return next()
  }
  if (err.isBoom) {
    res.status(err.output.payload.statusCode)
    return res.send(err.output.payload.message)
  } else {
    next(err)
  }
})

app.listen(port, function () {
  console.log(`App listening on port ${port} !`)
})
