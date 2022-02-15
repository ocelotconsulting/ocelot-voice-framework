const Alexa = require('ask-sdk-core')
const createHandler = require('./createHandler')
const createLocalizationInterceptor = require('./createLocalizationInterceptor')
const ErrorHandler = require('./ErrorHandler')

module.exports = ({ conversationSet, fetchSession, saveSession, dialogs }) => {
  const StateHandler = createHandler({ conversationSet, fetchSession, saveSession })
  const DialogInterceptor = createLocalizationInterceptor(dialogs)

  return Alexa.SkillBuilders
    .custom()
    .addRequestHandlers(StateHandler)
    .addRequestInterceptors(DialogInterceptor)
    .addErrorHandlers(ErrorHandler)
    .lambda()
}
