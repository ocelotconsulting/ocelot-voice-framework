module.exports = ({
  formatContext = ctx => ctx,
  overrideResume = false,
  states,
  currentSubConversation,
}) => {
  const conversationType = Object.keys(currentSubConversation)[0]
  const {
    machineState: state,
    machineContext: unformattedContext,
  } = currentSubConversation[conversationType]
  const context = formatContext(unformattedContext)

  if (!states[state]) {
    return ''
  }

  return context.resuming && !overrideResume ?
    `${states.resume(context)} ${states[state](context)}` :
    states[state](context)
}
