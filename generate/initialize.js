const createHandler = require('./createHandler')
const createLocalizationInterceptor = require('./createLocalizationInterceptor')
const ErrorHandler = require('./ErrorHandler')
const defaultDialog = require('../dialog/home')

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
  DialogInterceptor: createLocalizationInterceptor({ ...defaultDialog, ...dialog }),
  ErrorHandler,
})
