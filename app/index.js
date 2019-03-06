
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { createOrUpdateProject } = require('./updater')

const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => res.send('Welcome to the updater 🤪'))

app.post('/update', async (req, res, next) => {
  const parameters = {
    projectName: req.query.projectName || req.body.projectName,
    reference: req.query.reference || req.body.reference
  }
  const output = await createOrUpdateProject(parameters)
    .catch(err => next(err))
  res.send(output)
})

app.use((err, req, res, next) => {
  if (!err) {
    return next()
  }
  if (err.isBoom) {
    res.status(err.output.payload.statusCode)
    const output = [err.output.payload.message]
    if (err.commandError) {
      output.push('Command error:')
      output.push(err.commandError.join('\r\n'))
    }
    if (err.commandOutput) {
      output.push('Command output:')
      output.push(err.commandOutput.join('\r\n'))
    }
    return res.send(output.join('\r\n'))
  } else {
    next(err)
  }
})

app.listen(port, function () {
  console.log(`App listening on port ${port} !`)
})
