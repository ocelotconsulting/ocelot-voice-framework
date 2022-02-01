const Dialog = require('./Dialog')

module.exports = dialogs => ({
  process: handlerInput => {
    const dialog = new Dialog(handlerInput.requestEnvelope.request.locale, dialogs)
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes()

    requestAttributes.t = (...args) => dialog.getText(...args)
  },
})
