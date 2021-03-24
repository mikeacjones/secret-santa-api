const asyncMW = require('./async')
const redditService = require('../services/reddit')

module.exports = asyncMW(async (req, res, next) => {
    if (!req.headers.authorization) throw { code: 401 }
    const authHeaderMatches = req.headers.authorization.match(/[B|b]earer (.+)/)
    if (!authHeaderMatches) throw { code: 401 }
    req.reddit = {
      token: authHeaderMatches[1],
      userInfo: await redditService.getUserInfo(authHeaderMatches[1]),
    }
    next()
  })
