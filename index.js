const Alexa = require('ask-sdk-core')
const ErrorHandler = require('./generate/ErrorHandler')

module.exports = {
  generate: require('./generate'),
  generateApp: ({ StateHandler, DialogInterceptor }) => Alexa.SkillBuilders
    .custom()
    .addRequestHandlers(StateHandler)
    .addRequestInterceptors(DialogInterceptor)
    .addErrorHandlers(ErrorHandler)
    .lambda(),
  utils: require('./utils'),
  conversationTemplates: require('./conversationTemplates'),
}
