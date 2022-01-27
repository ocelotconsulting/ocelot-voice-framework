const Dialog = require('./Dialog')

const LocalizationInterceptor = {
  process: handlerInput => {
    const dialog = new Dialog(handlerInput.requestEnvelope.request.locale)
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes()

    requestAttributes.t = (...args) => dialog.getText(...args)
  },
};

module.exports = LocalizationInterceptor
