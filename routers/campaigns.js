const express = require('express')
const router = express.Router()
const redditAuthMW = require('../middleware/redditAuth')
const asyncMW = require('../middleware/async')
const campaignService = require('../services/campaigns')

router.use(redditAuthMW)
router.post(
  '/',
  asyncMW(async (req, res, _next) => {
    res.json(await campaignService.createCampaign(req.body, req.reddit))
  })
)

router.get(
  '/:id',
  asyncMW(async (req, res, _next) => {
    const campaign = await campaignService.campaignById(req.params.id, req.reddit.token, req.reddit.userInfo)
    res.json(campaign)
  })
)

router.post(
  '/:id/join',
  asyncMW(async (req, res, _next) => {
    const campaign = await campaignService.campaignById(req.params.id, req.reddit.token, req.reddit.userInfo)
    if (!campaign.userStatus.canJoin) {
      throw {
        code: 403,
        message: campaign.userStatus.missingRequirements,
      }
    }
    if (campaign.matchesGeneratedOn) throw { code: 403, message: `Can not join a campaign after matches have been generated` }
    const registration = await campaignService.register(campaign, req.reddit.userInfo, req.body)
    res.json(registration)
  })
)

router.get(
  '/:id/registrants',
  asyncMW(async (req, res, _next) => {
    res.json(await campaignService.registrants(req.params.id, req.reddit.token))
  })
)

router.delete(
  '/:id/registrants/:regId',
  asyncMW(async (req, res, _next) => {
    await campaignService.removeRegistrant(req.params.id, req.params.regId, req.reddit)
    res.status(204).send()
  })
)

module.exports = router
