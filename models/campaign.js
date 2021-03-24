const mongoose = require('mongoose')
const CampaignRegistration = require('./campaignRegistration')

const schema = mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  subreddit: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  requirements: {
    commentKarma: Number,
    postKarma: Number,
    totalKarma: Number,
    accountAge: Number,
    subscribed: Boolean,
    flairRegex: String,
  },
  customForm: [
    {
      question: {
        type: String,
        required: true,
      },
      required: {
        type: Boolean,
        required: true,
      },
      visible: {
        type: Boolean,
        required: true,
      },
      questionType: {
        type: String,
        default: 'text',
        required: true,
        enum: ['text', 'select-single', 'select-multi'],
      },
      options: {
        type: [String],
        required: function () {
          return this.questionType !== 'text'
        },
        validate: [
          function (options) {
            return this.questionType === 'text' || options.length > 0
          },
          'You must provide a list of value options for field {PATH}',
        ],
      },
    },
  ],
  matchesGeneratedOn: Date,
  matches: {
    type: [
      {
        giftee: {
          type: mongoose.ObjectId,
          required: true,
        },
        gifter: {
          type: mongoose.ObjectId,
          required: true,
        },
      },
    ],
    required: true,
    default: null,
  },
})

schema.methods.userHasJoined = async function (userInfo) {
  const campaignReg = await CampaignRegistration.findOne({ campaignId: this.id, userId: userInfo.name })
  return campaignReg !== null && campaignReg !== undefined
}

schema.methods.userCanJoin = function (userInfo, subredditInfo) {
  const today = new Date()
  if (this.startDate > today) return { canJoin: false, missingRequirements: ['This campaign is not open for registration yet'] }
  if (this.endDate < today) return { canJoin: false, missingRequirements: ['This campaign has already closed'] }

  if (!this.requirements) return { canJoin: true }
  const missingRequirements = []

  const reqs = Object.entries(this.requirements)
  for (var i in reqs) {
    const req = reqs[i]
    if (req[1] === undefined) continue
    switch (req[0]) {
      case 'commentKarma':
        if (userInfo.comment_karma < req[1]) missingRequirements.push('Do not meet minimum comment karma requirement')
        break
      case 'postKarma':
        if (userInfo.total_karma - userInfo.comment_karma < req[1]) missingRequirements.push('Do not meet minimum post karma requirement')
        break
      case 'totalKarma':
        if (userInfo.total_karma < req[1]) missingRequirements.push('Do not meet minimum karma requirement')
        break
      case 'accountAge':
        var minimumAccountAgeDate = new Date()
        minimumAccountAgeDate.setDate(minimumAccountAgeDate.getDate() - req[1])
        var createdDate = new Date(userInfo.created_utc * 1000)
        if (createdDate > minimumAccountAgeDate) missingRequirements.push('Do not meet minimum account age')
        break
      case 'subscribed':
        if (!subredditInfo.user_is_subscriber) missingRequirements.push('You must be subscribed to the subreddit')
        break
      case 'flairRegex':
        var re = new RegExp(req[1])
        if (!re.test(subredditInfo.user_flair_text)) missingRequirements.push('Your flair does not match requirement')
        break
    }
  }

  return { canJoin: missingRequirements.length <= 0, missingRequirements }
}

module.exports = mongoose.model('campaign', schema)
