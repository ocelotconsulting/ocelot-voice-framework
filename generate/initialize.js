const createHandler = require('./createHandler')
const createLocalizationInterceptor = require('./createLocalizationInterceptor')
const ErrorHandler = require('./ErrorHandler')

module.exports = ({
  conversationSet,
  fetchSession,
  saveSession,
  dialog,
}) => ({
  StateHandler: createHandler({
    conversationSet,
    fetchSession,
    saveSession,
  }),
  DialogInterceptor: createLocalizationInterceptor(dialog),
  ErrorHandler,
})
