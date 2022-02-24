const Alexa = require('ask-sdk-core')
const initialize = require('./initialize')

module.exports = ({
  conversationSet,
  fetchSession,
  saveSession,
  dialog,
}) => {
  const { StateHandler, DialogInterceptor, ErrorHandler } = initialize({
    conversationSet,
    fetchSession,
    saveSession,
    dialog,
  })

  return Alexa.SkillBuilders
    .custom()
    .addRequestHandlers(StateHandler)
    .addRequestInterceptors(DialogInterceptor)
    .addErrorHandlers(ErrorHandler)
    .lambda()
}
