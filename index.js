const Alexa = require('ask-sdk-core')
const ErrorHandler = require('./generate/ErrorHandler')
const generate = require('./generate')

module.exports = {
  initialize,
  generate: ({ conversationSet, fetchSession, saveSession, dialogs }) => {
    const { StateHandler, DialogInterceptor } = generate({ conversationSet, fetchSession, saveSession, dialogs })
    console.log('generate: ', StateHandler, DialogInterceptor)

    return Alexa.SkillBuilders
      .custom()
      .addRequestHandlers(StateHandler)
      .addRequestInterceptors(DialogInterceptor)
      .addErrorHandlers(ErrorHandler)
      .lambda()
  },
  generateApp: ({ StateHandler, DialogInterceptor }) => console.log('generateApp: ', StateHandler, DialogInterceptor) || Alexa.SkillBuilders
    .custom()
    .addRequestHandlers(StateHandler)
    .addRequestInterceptors(DialogInterceptor)
    .addErrorHandlers(ErrorHandler)
    .lambda(),
  utils: require('./utils'),
  conversationTemplates: require('./conversationTemplates'),
}
