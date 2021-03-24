const express = require('express')
const config = require('./config')
const mongoose = require('mongoose')
const redditService = require('./services/reddit')
const app = express()
const connectionString = `mongodb+srv://${config.mongo.username}:${config.mongo.password}@${config.mongo.host}/${config.mongo.database}?retryWrites=true&w=majority`

redditService.connect(config.reddit.client_id, config.reddit.client_secret, config.reddit.redirect_uri)

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }).then(_ => {
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())
  app.use('/v1/oauth', require('./routers/oauth'))
  app.use('/v1/reddit', require('./routers/reddit'))
  app.use('/v1/campaigns', require('./routers/campaigns'))
  app.use(require('./middleware/errorhandler'))

  app.listen(config.port)
  console.log(`Express listening on ${config.port}`)
})
