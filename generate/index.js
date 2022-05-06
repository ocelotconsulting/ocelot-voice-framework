const Alexa = require('ask-sdk-core')
const initialize = require('./initialize')
const {skillIdInterceptor} = require('./skillIdInterceptor')

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

  console.log('TODO delete me ', DialogInterceptor, typeof DialogInterceptor.process, skillIdInterceptor, typeof skillIdInterceptor.process)

  return Alexa.SkillBuilders
    .custom()
    .addRequestHandlers(StateHandler)
    .addRequestInterceptors([DialogInterceptor, skillIdInterceptor])
    .addErrorHandlers(ErrorHandler)
    .lambda()
}
