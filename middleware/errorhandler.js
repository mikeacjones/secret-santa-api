module.exports = (err, _req, res, _next) => {
  console.log('ERROR:')
  console.log(err)
  console.error(err)

  if (err.code === 401) {
    return res.status(401).send({ message: 'Invalid authorization' })
  }

  if (err.name === 'ValidationError') {
    return res.status(400).send({ message: err.message })
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(404).send({ message: `Resource with ID '${err.value}' not found` })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).send({ message: 'Invalid JSON - please validate' })
  }

  if (err.code && err.message) {
    return res.status(err.code).send({ message: err.message })
  }

  res.status(500).send({ message: 'Internal error occurred' })
  console.error(JSON.stringify(err))
}
