const createHandler = require('./createHandler')
const createLocalizationInterceptor = require('./createLocalizationInterceptor')
const ErrorHandler = require('./ErrorHandler')

module.exports = ({
  conversationSet,
  fetchSession,
  saveSession,
  dialog,
  greetingDialog,
  reEngageDialog,
}) => ({
  StateHandler: createHandler({
    conversationSet,
    fetchSession,
    saveSession,
    greetingDialog,
    reEngageDialog,
  }),
  DialogInterceptor: createLocalizationInterceptor(dialog),
  ErrorHandler,
})
