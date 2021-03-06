module.exports = ({
  formatContext = ctx => ctx,
  overrideResume = false,
  currentSubConversation,
  dialogMap = {},
  dialog,
  transitionStates = [],
}) => {
  const transitions = typeof transitionStates === 'string' ? [ transitionStates ] : transitionStates
  const conversationType = Object.keys(currentSubConversation)[0]
  const {
    machineState: state,
    machineContext: unformattedContext,
  } = currentSubConversation[conversationType]
  const context = formatContext(unformattedContext)

  if (!state || transitions.includes(state)) {
    return ''
  }

  const response = dialogMap[state] ? dialogMap[state](context, dialog) : dialog(`${conversationType}.${state}`, context, false)

  return context.resuming && !overrideResume && dialogMap.resume(context) ?
    `${dialogMap.resume(context)} ${response}` : response
}
