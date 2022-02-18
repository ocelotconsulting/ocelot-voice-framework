const Alexa = require('ask-sdk-core')
const initialize = require('./initialize')

module.exports = ({
  conversationSet,
  fetchSession,
  saveSession,
  dialogs,
  greetingDialog,
  reEngageDialog,
}) => {
  const { StateHandler, DialogInterceptor, ErrorHandler } = initialize({
    conversationSet,
    fetchSession,
    saveSession,
    dialogs,
    greetingDialog,
    reEngageDialog,
  })

  return Alexa.SkillBuilders
    .custom()
    .addRequestHandlers(StateHandler)
    .addRequestInterceptors(DialogInterceptor)
    .addErrorHandlers(ErrorHandler)
    .lambda()
}
