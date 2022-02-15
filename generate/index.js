const createHandler = require('./createHandler')
const createLocalizationInterceptor = require('./createLocalizationInterceptor')
const ErrorHandler = require('./ErrorHandler')

module.exports = ({ conversationSet, fetchSession, saveSession, dialogs }) => ({
  StateHandler: createHandler({ conversationSet, fetchSession, saveSession }),
  DialogInterceptor: createLocalizationInterceptor(dialogs),
  ErrorHandler,
})
