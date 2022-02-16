const Alexa = require('ask-sdk-core')
const createHandler = require('./createHandler')
const createLocalizationInterceptor = require('./createLocalizationInterceptor')
const ErrorHandler = require('./ErrorHandler')

module.exports = ({ conversationSet, fetchSession, saveSession, dialogs }) => Alexa.SkillBuilders
  .custom()
  .addRequestHandlers(createHandler({ conversationSet, fetchSession, saveSession }))
  .addRequestInterceptors(createLocalizationInterceptor(dialogs))
  .addErrorHandlers(ErrorHandler)
  .lambda()
