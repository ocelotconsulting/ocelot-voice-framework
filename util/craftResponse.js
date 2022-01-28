module.exports = ({
  finalWords = false,
  formatContext = ctx => ctx,
  overrideResume = false,
  states,
  subConversation,
}) => {
  if (finalWords) {
    return ''
  }

  const conversationType = Object.keys(subConversation)[0]
  const {
    machineState: state,
    machineContext: unformattedContext,
  } = subConversation[conversationType]
  const context = formatContext(unformattedContext)

  if (!states[state]) {
    return ''
  }

  return context.resuming && !overrideResume ?
    `${states.resume(context)} ${states[state](context)}` :
    states[state](context);
}
