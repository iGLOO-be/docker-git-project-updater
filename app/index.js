
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { createOrUpdateProject } = require('./updater')
const Boom = require('boom')

const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', function (req, res) {
  res.send('Welcome to the updater 🤪')
})

app.post('/update', async (req, res, next) => {
  if (!req.body.projectName || !req.body.reference) {
    const err = Boom.badRequest()
    res.status(err.output.payload.statusCode)
    return res.send(err.output.payload.message)
  }
  try {
    const output = await createOrUpdateProject(req.body)
    res.send(output)
  } catch (err) {
    debugger
    if (err.isBoom) {
      res.status(err.output.payload.statusCode)
      return res.send(err.output.payload.message)
    } else {
      next(err)
    }
  }
})

app.listen(port, function () {
  console.log(`App listening on port ${port} !`)
})
