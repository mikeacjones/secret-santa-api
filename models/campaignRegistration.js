const mongoose = require('mongoose')

const schema = mongoose.Schema({
  campaignId: {
    type: mongoose.ObjectId,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  registeredAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  customForm: {
    type: [
      {
        questionId: {
          type: mongoose.ObjectId,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
      },
    ],
    validate: [
      async function (answers) {
        const CampaignModel = require('./campaign')
        const campaign = await CampaignModel.findById(this.campaignId)
        if (!campaign.customForm) return true
        const requiredFields = campaign.customForm.filter(q => q.required)
        if (requiredFields.length === 0) return true
        for (var i in requiredFields) {
          const requiredField = requiredFields[i]
          const answer = answers.find(a => a.questionId.equals(requiredField.id))
          if (!answer || !answer.answer || answer.answer === '') throw { message: `Question '${requiredField.question}' must be answered`}
          if (requiredField.questionType.startsWith('select')) {
            if (!requiredField.options.includes(answer.answer)) throw { message: `Question '${requiredField.question}' has invalid answer`}
          }
        }
      },
      'Custom form missing answers',
    ],
  },
  shipping: {
    fullName: {
      type: String,
      required: true,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: String,
    city: String,
    stateProvRegion: {
      type: String,
      required: true,
    },
    zipCode: String,
    country: String,
    additionalNotes: String,
  },
})

module.exports = mongoose.model('campaignRegistration', schema)
