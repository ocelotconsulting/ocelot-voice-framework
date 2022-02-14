const createHandler = require('./createHandler')
const createLocalizationInterceptor = require('./createLocalizationInterceptor')
const ErrorHandler = require('./ErrorHandler')
const BuiltIn = require('./conversation/builtin')
const Utils = require('./util')

module.exports = ({ conversationSet, fetchSession, saveSession, dialogs }) => ({
  StateHandler: createHandler({ conversationSet, fetchSession, saveSession }),
  DialogInterceptor: createLocalizationInterceptor(dialogs),
  ErrorHandler,
  BuiltIn,
  Utils,
})
