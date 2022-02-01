const Dialog = require('./Dialog')

module.exports = translations => ({
  process: handlerInput => {
    const allTranslations =  formatAndMerge({
      [handlerInput.requestEnvelope.request.locale]: {
        translation: { ...translations },
      },
    })
    const dialog = new Dialog(handlerInput.requestEnvelope.request.locale, allTranslations)
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes()

    requestAttributes.t = (...args) => dialog.getText(...args)
  },
})
