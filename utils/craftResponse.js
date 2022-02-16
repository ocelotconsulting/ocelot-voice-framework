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

  const response = dialogMap[state] ?
    dialogMap[state](context) :
    dialog(`${conversationType}.${state}`, context)
  const resumeResponse = dialogMap[state] ?
    `${dialogMap.resume(context)} ${response}` :
    `${dialog(`${conversationType}.resume`, context)} ${response}`

  return context.resuming && !overrideResume ? resumeResponse : response
}
