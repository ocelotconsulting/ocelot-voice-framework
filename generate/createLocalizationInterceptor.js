const Dialog = require('./Dialog')
const formatAndMerge = require('../utils/formatAndMerge')
const { home } = require('../dialog/home')

module.exports = translations => ({
  process: handlerInput => {
    const allTranslations = formatAndMerge({
      [handlerInput.requestEnvelope.request.locale]: {
        translation: { home, ...translations },
      },
    })
    const dialog = new Dialog(handlerInput.requestEnvelope.request.locale, allTranslations)
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes()

    requestAttributes.t = (...args) => dialog.getText(...args)
  },
})
