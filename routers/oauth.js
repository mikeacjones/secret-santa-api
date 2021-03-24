const express = require('express')
const router = express.Router()
const asyncMW = require('../middleware/async')
const redditService = require('../services/reddit')

router.post('/token', asyncMW(async (req, res, _next) => {
  if (!req.body || !req.body.code) throw { code: 400, message: 'Invalid request' }
  const code = req.body.code
  const token = await redditService.getToken(code)
  res.json({ token })
}))

module.exports = router