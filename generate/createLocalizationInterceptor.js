const Dialog = require('./Dialog')
const formatAndMerge = require('../utils/formatAndMerge')
const generateHomeDialog = require('../dialog/home')

module.exports = translations => ({
  process: handlerInput => {
    const allTranslations = formatAndMerge({
      [handlerInput.requestEnvelope.request.locale]: {
        translation: { home: generateHomeDialog(translations.home), ...translations },
      },
    })
    console.log('allTranslations', JSON.stringify(allTranslations))
    const dialog = new Dialog(handlerInput.requestEnvelope.request.locale, allTranslations)
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes()

    requestAttributes.t = (...args) => dialog.getText(...args)
  },
})
