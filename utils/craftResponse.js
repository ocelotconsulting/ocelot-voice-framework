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

  try {
    const response = dialogMap[state] ? dialogMap[state](context) : dialog(`${conversationType}.${state}`, context)

    return context.resuming && !overrideResume && dialogMap.resume(context) ?
      `${dialogMap.resume(context)} ${response}` : response
  } catch (err) {
    console.error(`No dialog options specified for state '${state}'.  Either define a function for dialogMap.${state} or add ${conversationType}.${state} to your dialog options json`)

    throw err
  }
}
