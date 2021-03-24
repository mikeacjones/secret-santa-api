module.exports = {
  port: process.env.PORT || 3000,
  reddit: {
    client_id: process.env.REDDIT_CLIENT_ID,
    client_secret: process.env.REDDIT_CLIENT_SECRET,
    redirect_uri: process.env.REDDIT_REDIRECT_URI,
  },
  mongo: {
    host: process.env.MONGO_HOST,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    database: process.env.MONGO_DATABASE,
  }
}
