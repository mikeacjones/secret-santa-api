const express = require('express')
const router = express.Router()
const asyncMW = require('../middleware/async')
const redditAuthMW = require('../middleware/redditAuth')
const redditService = require('../services/reddit')

router.use(redditAuthMW)
router.get('/userinfo', (req, res, _next) => {
  res.json(req.reddit.userInfo)
})
router.get(
  '/r/:subreddit',
  asyncMW(async (req, res, _next) => {
    res.json(await redditService.getSubredditInfo(req.reddit.token, req.params.subreddit))
  })
)

module.exports = router
