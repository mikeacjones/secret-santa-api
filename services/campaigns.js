const Campaign = require('../models/campaign')
const CampaignRegistration = require('../models/campaignRegistration')
const redditService = require('./reddit')

campaignById = async (id, token, userInfo) => {
  const campaign = await Campaign.findById(id)
  if (!campaign) throw { code: 404, message: `Could not find campaign with ID ${id}` }

  const subredditInfo = await redditService.getSubredditInfo(token, campaign.subreddit)
  const userHasJoined = await campaign.userHasJoined(userInfo)
  const userCanJoin = userHasJoined
    ? { hasJoined: true, canJoin: false, missingRequirements: ['You have already joined this campaign'] }
    : { hasJoined: false, ...campaign.userCanJoin(userInfo, subredditInfo) }

  return {
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    subreddit: campaign.subreddit,
    userStatus: userCanJoin,
    customForm: campaign.customForm,
  }
}

createCampaign = async (payload, reddit) => {
  const newCampaign = new Campaign({ ...payload, owner: reddit.userInfo.name })
  await newCampaign.validate()
  const subreddit = await redditService.getSubredditInfo(reddit.token, newCampaign.subreddit)
  if (subreddit.user_is_moderator !== true)
    throw { code: 403, message: 'You must be a moderator to start a secret santa campaign for a subreddit' }
  await newCampaign.save()
  return newCampaign
}

register = async (campaign, userInfo, payload) => {
  const campaignReg = new CampaignRegistration({
    campaignId: campaign.id,
    userId: userInfo.name,
    customForm: payload.customForm,
    shipping: payload.shipping,
  })
  await campaignReg.save()
  return campaignReg
}

registrants = async (id, token) => {
  const campaign = await Campaign.findById(id)
  if (!campaign) throw { code: 404, message: `Could not find campaign with ID ${id}` }
  const subreddit = await redditService.getSubredditInfo(token, campaign.subreddit)
  if (subreddit.user_is_moderator !== true)
    throw { code: 403, message: `You must be a moderator of ${campaign.subreddit} to view registrants` }
  const registeredUsers = await CampaignRegistration.find({ campaignId: campaign.id })
  return registeredUsers
}

removeRegistrant = async (campId, regId, reddit) => {
  const campaign = await Campaign.findById(campId)
  if (!campaign) throw { code: 404, message: `Could not find campaign with ID ${campId}` }
  if (campaign.matchesGeneratedOn) throw { code: 403, message: `Can not remove a registrant after matching has been completed` }

  const registration = await CampaignRegistration.findById(regId)
  if (!registration) throw { code: 404, message: `Could not find registration with ID ${regId}` }

  if (registration.userId !== reddit.userInfo.name) {
    const subreddit = await redditService.getSubredditInfo(reddit.token, campaign.id)
    if (subreddit.user_is_moderator !== true)
      throw { code: 403, message: `You must be a moderator of ${campaign.subreddit} to remove registrants` }
  }

  return await CampaignRegistration.findByIdAndDelete(regId)
}

module.exports = {
  campaignById,
  createCampaign,
  register,
  registrants,
  removeRegistrant,
}
