module.exports = ({
  formatContext = ctx => ctx,
  overrideResume = false,
  currentSubConversation,
  dialogMap = {},
  dialog,
  transitionStates = [],
}) => {
  const conversationType = Object.keys(currentSubConversation)[0]
  const {
    machineState: state,
    machineContext: unformattedContext,
  } = currentSubConversation[conversationType]
  const context = formatContext(unformattedContext)

  if (transitionStates.includes(state)) {
    return ''
  }

  console.log('right here!!', JSON.stringify({ dialogMap, state, result: dialogMap[state](context) }))

  const response = dialogMap[state] ? dialogMap[state](context) : dialog(`${conversationType}.${state}`, context)

  return context.resuming && !overrideResume && dialogMap.resume(context) ?
    `${dialogMap.resume(context)} ${response}` : response
}
